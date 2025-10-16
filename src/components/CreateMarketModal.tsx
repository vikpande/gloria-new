"use client"

import { CloseOutlined } from "@ant-design/icons"
import Button from "antd/es/button"
import Input from "antd/es/input"
import Modal from "antd/es/modal"
import Select from "antd/es/select"
import message from "antd/es/message"
import type { MarketCardProps } from "@src/components/MarketCard"
import { getCategoryOptions } from "@src/utils/categories"
import type React from "react"
import { useState } from "react"

const { TextArea } = Input

interface CreateMarketModalProps {
    open: boolean
    onClose: () => void
    onCreateMarket: (market: MarketCardProps) => void
}

const CreateMarketModal: React.FC<CreateMarketModalProps> = ({
    open,
    onClose,
    onCreateMarket,
}) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        date: "",
    })
    const [loading, setLoading] = useState(false)

    const categoryOptions = getCategoryOptions()

    const handleInputChange = (
        field: string,
        value: string
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSubmit = async () => {
        // Validation
        if (!formData.title.trim()) {
            message.error("Please enter a market title")
            return
        }

        if (!formData.category) {
            message.error("Please select a category")
            return
        }

        if (!formData.date) {
            message.error("Please select an end date")
            return
        }

        const selectedDate = new Date(formData.date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (selectedDate < today) {
            message.error("End date must be in the future")
            return
        }

        setLoading(true)

        try {
            // Create new market with default values
            const newMarket: MarketCardProps = {
                id: `market-${Date.now()}`,
                title: formData.title.trim(),
                description: formData.description.trim() || undefined,
                category: formData.category,
                date: formData.date,
                yesPrice: 50,
                noPrice: 50,
                volume: 0,
                probability: 50,
                trend: "neutral",
                isFavorite: false,
            }

            onCreateMarket(newMarket)
            message.success("Market created successfully!")

            // Reset form
            setFormData({
                title: "",
                description: "",
                category: "",
                date: "",
            })

            onClose()
        } catch (error) {
            message.error("Failed to create market. Please try again.")
            console.error("Error creating market:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        setFormData({
            title: "",
            description: "",
            category: "",
            date: "",
        })
        onClose()
    }

    // Get minimum date (tomorrow)
    const getTomorrowDate = () => {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow.toISOString().split('T')[0]
    }

    return (
        <Modal
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={600}
            closeIcon={<CloseOutlined />}
            centered
        >
            <div className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Create New Market
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                    Create a prediction market for any future event
                </p>

                <div className="space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Market Question <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="e.g., Will Bitcoin reach $150k by end of 2025?"
                            value={formData.title}
                            onChange={(e) => handleInputChange("title", e.target.value)}
                            size="large"
                            maxLength={200}
                            showCount
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <TextArea
                            placeholder="Provide additional context or details about the market..."
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            rows={4}
                            maxLength={500}
                            showCount
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <Select
                            placeholder="Select a category"
                            value={formData.category || undefined}
                            onChange={(value) => handleInputChange("category", value)}
                            size="large"
                            className="w-full"
                            options={categoryOptions}
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Market End Date <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleInputChange("date", e.target.value)}
                            size="large"
                            min={getTomorrowDate()}
                            placeholder="Select end date"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            The date when the market outcome will be determined
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-8">
                    <Button
                        onClick={handleCancel}
                        size="large"
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleSubmit}
                        loading={loading}
                        size="large"
                        className="flex-1 bg-black hover:bg-gray-800"
                    >
                        Create Market
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

export default CreateMarketModal

