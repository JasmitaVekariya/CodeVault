const AWS = require('aws-sdk');
const fsPromises = require('fs').promises;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

AWS.config.update({region:"us-east-1"});

const realS3 = new AWS.S3();
const S3_BUCKET = "githubcolnebucket";

let s3 = realS3;

if (process.env.USE_LOCAL_S3 === 'true') {
  const localS3Dir = path.resolve(process.cwd(), "local_s3_bucket");
  console.log("⚠️ USING LOCAL S3 MOCK");

  s3 = {
    putObject: (params) => ({
      promise: async () => {
        const fullPath = path.join(localS3Dir, params.Bucket, params.Key);
        if (params.Key.endsWith('/')) {
          await fsPromises.mkdir(fullPath, { recursive: true });
        } else {
          await fsPromises.mkdir(path.dirname(fullPath), { recursive: true });
          await fsPromises.writeFile(fullPath, params.Body || '');
        }
        return {};
      }
    }),

    upload: (params) => s3.putObject(params),

    getObject: (params) => {
      const fullPath = path.join(localS3Dir, params.Bucket, params.Key);
      return {
        promise: async () => {
          const body = await fsPromises.readFile(fullPath);
          return { Body: body };
        },
        createReadStream: () => fs.createReadStream(fullPath)
      };
    },

    deleteObjects: (params) => ({
      promise: async () => {
        for (const obj of params.Delete.Objects) {
          const fullPath = path.join(localS3Dir, params.Bucket, obj.Key);
          try {
             const stats = await fsPromises.stat(fullPath);
             if (stats.isDirectory()) {
                await fsPromises.rm(fullPath, { recursive: true, force: true });
             } else {
                await fsPromises.unlink(fullPath);
             }
          } catch (err) {}
        }
        return {};
      }
    }),

    copyObject: (params) => ({
      promise: async () => {
        const sourcePath = path.join(localS3Dir, params.CopySource);
        const destPath = path.join(localS3Dir, params.Bucket, params.Key);
        await fsPromises.mkdir(path.dirname(destPath), { recursive: true });
        try {
           const stats = await fsPromises.stat(sourcePath);
           if (stats.isDirectory()) {
             await fsPromises.cp(sourcePath, destPath, { recursive: true });
           } else {
             await fsPromises.copyFile(sourcePath, destPath);
           }
        } catch (err) {
           console.log("Mock copyObject error:", err);
        }
        return {};
      }
    }),

    listObjectsV2: (params) => ({
      promise: async () => {
        const prefix = params.Prefix || '';
        const prefixParts = prefix.split('/');
        const prefixDir = prefixParts.slice(0, -1).join('/');
        
        const baseDir = path.join(localS3Dir, params.Bucket, prefixDir);
        let contents = [];
        let commonPrefixes = new Set();

        async function walk(dir) {
          try {
            const files = await fsPromises.readdir(dir, { withFileTypes: true });
            for (const file of files) {
              const res = path.resolve(dir, file.name);
              const relativePath = path.relative(path.join(localS3Dir, params.Bucket), res).replace(/\\/g, '/');
              
              if (!relativePath.startsWith(prefix.replace(/\/$/, ''))) {
                  continue;
              }
              
              const remainder = relativePath.substring(prefix.length);
              
              if (params.Delimiter && remainder.includes(params.Delimiter)) {
                 const parts = remainder.split(params.Delimiter);
                 commonPrefixes.add(prefix + parts[0] + params.Delimiter);
                 continue;
              }

              if (file.isDirectory()) {
                if (params.Delimiter) {
                   commonPrefixes.add(relativePath + '/');
                } else {
                   contents.push({ Key: relativePath + '/' });
                   await walk(res);
                }
              } else {
                contents.push({ Key: relativePath });
              }
            }
          } catch (err) {
            // Ignore missing dirs
          }
        }
        
        await walk(baseDir);
        
        return {
          Contents: contents,
          CommonPrefixes: Array.from(commonPrefixes).map(p => ({ Prefix: p }))
        };
      }
    })
  };
}

module.exports = {s3, S3_BUCKET};  