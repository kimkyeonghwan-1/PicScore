import React from "react";
import { Link, useLocation } from "react-router-dom";

import board_bar from "../../assets/board_bar.png";
import ranking_bar from "../../assets/Ranking_bar.png";
import Home_bar from "../../assets/Home_bar.png";
import Camera_bar from "../../assets/Camera_bar.png";
import User_bar from "../../assets/User_bar.png";

const BottomBar: React.FC<{ activeTab?: string }> = ({ activeTab }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const tabs = [
    { name: "Board", label: "게시글", path: "/board", icon: board_bar },
    { name: "Ranking", label: "랭킹", path: "/ranking", icon: ranking_bar },
    { name: "Home", label: "홈", path: "/", icon: Home_bar },
    {
      name: "Camera",
      label: "카메라",
      path: "/image-upload",
      icon: Camera_bar,
    },
    { name: "Profile", label: "프로필", path: "/mypage", icon: User_bar },
  ];

  return (
    <div className="fixed bottom-0 box-border bg-white border-t border-gray-100 max-w-md w-full">
      <div className="flex justify-around h-14">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            to={tab.path}
            className={`flex flex-col items-center justify-center ${
              activeTab === tab.name ||
              (!activeTab &&
                (currentPath === tab.path ||
                  (tab.path !== "/" && currentPath.startsWith(tab.path))))
                ? "text-pic-primary"
                : "text-gray-500"
            }`}
          >
            <div className="w-6 h-6 mb-1">
              <img
                src={tab.icon}
                alt={`${tab.label} 아이콘`}
                className={`w-full h-full ${
                  activeTab === tab.name ||
                  (!activeTab &&
                    (currentPath === tab.path ||
                      (tab.path !== "/" && currentPath.startsWith(tab.path))))
                    ? "opacity-100"
                    : "opacity-50"
                }`}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomBar;
