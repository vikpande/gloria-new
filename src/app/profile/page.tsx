"use client";

import React, { useMemo, useState } from "react";
import {
  Card,
  Avatar,
  Tag,
  Button,
  Form,
  Input,
  Typography,
  Divider,
  Space,
  Progress,
  List,
  Statistic,
  message,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
  AimOutlined,
  BarChartOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import { getCategoryNames } from "@src/utils/categories";

const { Title, Text } = Typography;
const { CheckableTag } = Tag;

const ALL_CATEGORIES = getCategoryNames();

const LEVELS = [
  { key: "Beginner", min: 0, max: 999 },
  { key: "Pro", min: 1000, max: 4999 },
  { key: "Expert", min: 5000, max: Infinity },
];

const ProfilePage: React.FC = () => {
  const [form] = Form.useForm();

  // mock data (replace with real)
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    badges: ["Verified"],
    memberSince: "Jan 15, 2024",
    stats: { winRate: 68.1, totalTrades: 47, totalVolume: 12450 },
    recent: [
      { title: "Won bet on Fed Rate Cut", date: "Sep 10, 2024", gain: 125.5 },
      {
        title: "Settled: US Election market",
        date: "Aug 30, 2024",
        gain: 78.2,
      },
      { title: "New position in BTC $100k", date: "Aug 18, 2024", gain: -25.0 },
    ],
  };

  // Rewards & Levels
  const [rewardPoints, setRewardPoints] = useState<number>(1840); // ← from API
  const levelInfo = useMemo(() => {
    const lvl = LEVELS.find(
      (l) => rewardPoints >= l.min && rewardPoints <= l.max
    )!;
    const nextMax = lvl.max === Infinity ? rewardPoints : lvl.max;
    const denom = nextMax - lvl.min || 1;
    const pct =
      lvl.max === Infinity
        ? 100
        : Math.min(100, Math.round(((rewardPoints - lvl.min) / denom) * 100));
    const toNext =
      lvl.max === Infinity ? 0 : Math.max(0, lvl.max + 1 - rewardPoints);
    return { current: lvl.key, progressPct: pct, toNext };
  }, [rewardPoints]);

  // Personal preferences
  const [selectedCats, setSelectedCats] = useState<string[]>([
    "Crypto",
    "Technology",
    "AI",
  ]);
  const toggleCat = (cat: string, checked: boolean) =>
    setSelectedCats((prev) =>
      checked ? [...prev, cat] : prev.filter((c) => c !== cat)
    );
  const savePreferences = () => message.success("Preferences saved");

  return (
    <div className="w-full">
      {/* Heading */}
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
        <p className="text-gray-500">
          Manage your account and view trading stats
        </p>
      </div>

      {/* ---- Balanced 12-column grid ---- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Row 1: Profile Form (8) + Stats (4) */}
        <Card
          className="xl:col-span-8 border border-gray-200 rounded-2xl"
          bodyStyle={{ padding: 20 }}
        >
          {/* Profile header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar size={64} icon={<UserOutlined />} className="bg-black" />
              <div>
                <div className="text-base font-semibold text-gray-900">
                  {user.name}
                </div>
                <div className="text-gray-500 text-sm">{user.email}</div>
                <Space size="small" className="mt-2">
                  {user.badges.map((b) => (
                    <Tag
                      key={b}
                      className="bg-gray-100 text-gray-700 border-0 rounded-full"
                    >
                      {b}
                    </Tag>
                  ))}
                </Space>
              </div>
            </div>
            <Button icon={<EditOutlined />} className="px-3">
              Edit Photo
            </Button>
          </div>

          <Divider className="!my-4" />

          {/* Form */}
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              firstName: "John",
              lastName: "Doe",
              email: user.email,
              phone: user.phone,
            }}
            onFinish={() => message.success("Profile updated")}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[{ required: true }]}
              >
                <Input placeholder="First name" />
              </Form.Item>
              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[{ required: true }]}
              >
                <Input placeholder="Last name" />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: "email", required: true }]}
              >
                <Input placeholder="Email" />
              </Form.Item>
              <Form.Item label="Phone" name="phone">
                <Input placeholder="Phone" />
              </Form.Item>
            </div>

            <div className="flex justify-end">
              <Button
                htmlType="submit"
                type="primary"
                className="bg-black hover:bg-gray-800 border-black"
              >
                Save Changes
              </Button>
            </div>
          </Form>
        </Card>

        <Card
          className="xl:col-span-4 border border-gray-200 rounded-2xl"
          bodyStyle={{ padding: 20 }}
        >
          <Title level={5} className="!mb-3">
            Trading Stats
          </Title>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <Space>
                <AimOutlined className="text-green-600" />
                <div>
                  <Text type="secondary">Win Rate</Text>
                  <div className="text-xl font-semibold">
                    {user.stats.winRate.toFixed(1)}%
                  </div>
                </div>
              </Space>
              <BarChartOutlined className="text-gray-400" />
            </div>

            <div className="flex items-center justify-between">
              <Space>
                <CalendarOutlined className="text-gray-500" />
                <div>
                  <Text type="secondary">Total Trades</Text>
                  <div className="text-xl font-semibold">
                    {user.stats.totalTrades}
                  </div>
                </div>
              </Space>
            </div>

            <div className="flex items-center justify-between">
              <Space>
                <DollarCircleOutlined className="text-gray-700" />
                <div>
                  <Text type="secondary">Total Volume</Text>
                  <div className="text-xl font-semibold">
                    ${user.stats.totalVolume.toLocaleString()}
                  </div>
                </div>
              </Space>
            </div>

            <Divider className="!my-3" />
            <Space>
              <CalendarOutlined className="text-gray-500" />
              <div>
                <Text type="secondary">Member Since</Text>
                <div className="font-medium">{user.memberSince}</div>
              </div>
            </Space>
          </div>
        </Card>

        {/* Row 2: Personal Preferences (8) + Rewards (4) */}
        <Card
          className="xl:col-span-8 border border-gray-200 rounded-2xl"
          bodyStyle={{ padding: 20 }}
        >
          <div className="mb-2">
            <Title level={5} className="!mb-0">
              Personal Preferences
            </Title>
            <Text type="secondary">
              Pick categories to personalize your feed
            </Text>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            {ALL_CATEGORIES.map((cat) => (
              <CheckableTag
                key={cat}
                checked={selectedCats.includes(cat)}
                onChange={(checked) => toggleCat(cat, checked)}
                className="pref-tag"
              >
                {cat}
              </CheckableTag>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              onClick={savePreferences}
              type="primary"
              className="bg-black hover:bg-gray-800 border-black"
            >
              Save Preferences
            </Button>
          </div>
        </Card>

        <Card
          className="xl:col-span-4 border border-gray-200 rounded-2xl"
          bodyStyle={{ padding: 20 }}
        >
          <div className="flex items-center justify-between mb-2">
            <Title level={5} className="!mb-0">
              Rewards
            </Title>
            <GiftOutlined className="text-gray-500" />
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-semibold text-gray-900">
                {rewardPoints.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">reward points earned</div>
            </div>
            <Button
              type="default"
              className="border-gray-300"
              onClick={() => setRewardPoints((p) => p + 50)}
            >
              Simulate +50
            </Button>
          </div>

          <Divider className="!my-3" />
          <div className="text-sm mb-1">
            Level: <span className="font-medium">{levelInfo.current}</span>
          </div>
          <Progress
            percent={levelInfo.progressPct}
            showInfo={false}
            strokeColor="#000"
          />
          <div className="mt-1 text-xs text-gray-500">
            {levelInfo.toNext === 0
              ? "Top tier achieved"
              : `${levelInfo.toNext.toLocaleString()} points to next level`}
          </div>

          <div className="mt-3 flex gap-2">
            {LEVELS.map((l) => (
              <Tag
                key={l.key}
                className={`border-0 ${levelInfo.current === l.key
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700"
                  }`}
              >
                {l.key}
              </Tag>
            ))}
          </div>
        </Card>

        {/* Row 3: Recent Activity (8) + Account Level (4) */}
        <Card
          className="xl:col-span-8 border border-gray-200 rounded-2xl"
          bodyStyle={{ padding: 20 }}
        >
          <div className="mb-2 flex items-center justify-between">
            <Title level={5} className="!mb-0">
              Recent Activity
            </Title>
            <Button type="text" className="text-gray-600 hover:!text-black">
              View All
            </Button>
          </div>

          <List
            dataSource={user.recent}
            renderItem={(item) => (
              <List.Item className="!px-0">
                <div className="w-full flex items-center justify-between">
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-gray-500">{item.date}</div>
                  </div>
                  <Statistic
                    value={Math.abs(item.gain)}
                    prefix="$"
                    precision={2}
                    valueStyle={{
                      color: item.gain >= 0 ? "#16a34a" : "#ef4444",
                      fontSize: 14,
                    }}
                    suffix={item.gain >= 0 ? " gain" : " loss"}
                  />
                </div>
              </List.Item>
            )}
          />
        </Card>

        <Card
          className="xl:col-span-4 border border-gray-200 rounded-2xl"
          bodyStyle={{ padding: 20 }}
        >
          <Title level={5} className="!mb-2">
            Account Level
          </Title>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mb-3">
              <UserOutlined className="text-white text-2xl" />
            </div>
            <div className="font-semibold">{levelInfo.current}</div>
            <div className="text-sm text-gray-500">
              {levelInfo.current === "Beginner" && "0 – 999 pts"}
              {levelInfo.current === "Pro" && "1,000 – 4,999 pts"}
              {levelInfo.current === "Expert" && "5,000+ pts"}
            </div>

            <div className="w-full mt-4">
              <Progress
                percent={levelInfo.progressPct}
                showInfo={false}
                strokeColor="#000"
                trailColor="#e5e7eb"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{levelInfo.current}</span>
                <span>{levelInfo.progressPct}%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
