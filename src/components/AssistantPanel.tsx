"use client"

import {
  CloseOutlined,
  RobotOutlined,
  SendOutlined,
  UserOutlined,
} from "@ant-design/icons"
import { Avatar, Button, Typography } from "antd"
import type React from "react"
import { useEffect, useRef, useState } from "react"

interface Message {
  id: string
  text: string
  timestamp: Date
  isUser: boolean
}

interface AssistantPanelProps {
  className?: string
  onCollapse?: () => void // ✅ new prop
}

const AssistantPanel: React.FC<AssistantPanelProps> = ({
  className = "",
  onCollapse,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Welcome to Insight Assistant! I can help you analyze markets, provide insights, and answer questions.",
      timestamp: new Date(),
      isUser: false,
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const handleSendMessage = () => {
    if (!inputValue.trim()) return
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      timestamp: new Date(),
      isUser: true,
    }
    setMessages((prev) => [...prev, newMessage])
    setInputValue("")
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "I understand your question. Let me help you analyze this market and provide insights.",
          timestamp: new Date(),
          isUser: false,
        },
      ])
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  return (
    <div
      className={`h-full flex flex-col bg-white border-l border-gray-200 ${className}`}
    >
      {/* Header with collapse button */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center">
            <RobotOutlined />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Insight Assistant
            </h3>
            <p className="text-xs text-gray-500">AI-powered market analysis</p>
          </div>
        </div>
        {onCollapse && (
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={onCollapse}
            className="text-gray-500 hover:text-black"
          />
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex items-end gap-2 max-w-[75%] ${m.isUser ? "flex-row-reverse" : ""
                }`}
            >
              <Avatar
                size="small"
                icon={m.isUser ? <UserOutlined /> : <RobotOutlined />}
                className={
                  m.isUser ? "bg-black text-white" : "bg-gray-300 text-white"
                }
              />
              <div
                className={`px-3 py-2 rounded-lg text-sm shadow-sm ${m.isUser ? "bg-black text-white" : "bg-gray-100 text-gray-800"
                  }`}
              >
                <p className="m-0">{m.text}</p>
                <Typography.Text className="block text-[10px] mt-1 opacity-60">
                  {m.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography.Text>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-gray-200 px-4 py-3 bg-white">
        <div className="flex items-center gap-2">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about markets, odds, or predictions..."
            className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-gray-50"
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="bg-black hover:bg-gray-800 border-none"
          />
        </div>
      </div>
    </div>
  )
}

export default AssistantPanel
