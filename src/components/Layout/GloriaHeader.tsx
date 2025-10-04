"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Layout,
  Menu,
  Avatar,
  Button,
  Badge,
  Dropdown,
  Drawer,
  Typography,
  Tooltip,
} from "antd";
import type { MenuProps } from "antd";
import {
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  WalletOutlined,
  MenuOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import AddTurboChainButton from "@src/components/AddTurboChainButton"
import { FeatureFlagsContext } from "@src/providers/FeatureFlagsProvider"
import dynamic from "next/dynamic"

const ConnectWallet = dynamic(() => import("@src/components/Wallet"), {
  ssr: false,
  loading: () => (
    <Button className="bg-black hover:bg-gray-900">
      Sign in
    </Button>
  ),
})


const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  balance?: number;
  user?: { name: string; avatar?: string };
  activeMenuKey?: string;
  onMenuClick?: (key: string) => void;
  onHideAssistant?: () => void;
  isAssistantVisible?: boolean;
}

const GloriaHeader: React.FC<HeaderProps> = ({
  balance = 1000.0,
  activeMenuKey = "markets",
  onMenuClick,
  onHideAssistant,
  isAssistantVisible = true,
}) => {

  const [drawerOpen, setDrawerOpen] = useState(false);

  const items: MenuProps["items"] = useMemo(
    () => [
      { key: "market", label: "Markets" },
      { key: "trending", label: "Trending" },
      { key: "news", label: "Breaking" },
    ],
    []
  );

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    onMenuClick?.(key);
    setDrawerOpen(false);
  };

  const userMenuItems = [
    { key: "profile", label: "Profile" },
    { key: "settings", label: "Settings" },
    { key: "logout", label: "Logout" },
  ];

  const handleUserMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "profile") {
      onMenuClick?.("profile");
    } else if (key === "settings") {
      onMenuClick?.("settings");
    } else if (key === "logout") {

    }
  };

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <AntHeader className="!px-4 lg:!px-6 bg-white h-16 flex items-center">
        {/* LEFT: Brand + Mobile Menu Button */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-300 lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
          >
            <MenuOutlined />
          </button>

          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 bg-black rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>

            <span className="text-base sm:text-lg font-semibold text-black">
              Gloria Beta
            </span>
          </Link>
        </div>

        <div className="hidden lg:flex flex-1 justify-center">
          <Menu
            mode="horizontal"
            selectedKeys={[activeMenuKey]}
            items={items}
            onClick={handleMenuClick}
            className="border-none text-gray-700"
            style={{ borderBottom: "none" }}
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-auto">
          {onHideAssistant && (
            <Tooltip
              title={isAssistantVisible ? "Hide Assistant" : "Show Assistant"}
            >
              <Button
                type="text"
                icon={<RobotOutlined />}
                className={`${isAssistantVisible ? "text-black" : "text-gray-400"
                  } hover:!text-black`}
                onClick={onHideAssistant}
              />
            </Tooltip>
          )}
          {/* <AddTurboChainButton /> */}
          <ConnectWallet />
        </div>
      </AntHeader>

      {/* Mobile Drawer for Navigation */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">G</span>
            </div>
            <span className="font-semibold">Gloria Beta</span>
          </div>
        }
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        bodyStyle={{ padding: 0 }}
      >
        <Menu
          mode="inline"
          selectedKeys={[activeMenuKey]}
          items={items}
          onClick={handleMenuClick}
          className="border-none"
        />
      </Drawer>
    </div>
  );
};

export default GloriaHeader;
