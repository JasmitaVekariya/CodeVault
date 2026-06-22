import React, { useEffect, useState } from "react";
import HeatMap from "@uiw/react-heat-map";

const genrateActiveData = (startDate, endDate) => {
  const data = [];
  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    const count = Math.floor(Math.random() * 50);
    data.push({
      date: currentDate.toISOString().split("T")[0],
      count: count,
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return data;
};

const getPannelColors = (maxCount) => {
  const colors = {};
  for (let i = 0; i <= maxCount; i++) {
    const greenValue = Math.floor((i / maxCount) * 255); 
    colors[i] = `rgb(0, ${greenValue}, 0)`; 
  }
  return colors;
};

const HeatMapProfile = () => {
  const [activityData, setActivityData] = useState([]);
  const [panelColors, setPanelColors] = useState({});

  useEffect(() => {
    const fetchData = () => {
      const startDate = "2025-01-01";
      const endDate = "2025-02-28"; 
      const data = genrateActiveData(startDate, endDate);
      setActivityData(data);

      const maxCount = Math.max(...data.map((item) => item.count));
      const colors = getPannelColors(maxCount);
      setPanelColors(colors);
    };
    fetchData();
  }, []);

  return (
    <div style={{ marginTop: "20px" }}>
      <h4>Recent Contributions</h4>
      <HeatMap
        className="HeatMapProfile"
        style={{ maxWidth: "700px", height: "200px", color: "white" }}
        value={activityData}
        weekLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
        startDate={new Date("2025-01-01")}
        endDate={new Date("2025-02-28")}
        rectSize={15}
        space={3}
        rectProps={{ rx: 2.5 }}
        panelColors={panelColors}
      />
    </div>
  );
};

export default HeatMapProfile;
