import { CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import type { ScriptLauncherInstance } from './main.js'

export function UpdateFeedbacks(self: ScriptLauncherInstance): void {
	const feedbacks: CompanionFeedbackDefinitions = {}

	feedbacks.fontInstalled = {
		name: 'Font is Installed',
		description: 'If the specified font is installed on the system, this feedback will be active.',
		type: 'boolean',
		options: [
			{
				type: 'textinput',
				label: 'Font Name',
				id: 'fontName',
				default: '',
				useVariables: true,
			},
			{
				type: 'dropdown',
				label: 'Installed or Not Installed',
				id: 'checkType',
				default: 'installed',
				choices: [
					{ id: 'installed', label: 'Installed' },
					{ id: 'not_installed', label: 'Not Installed' },
				],
			},
		],
		defaultStyle: {
			color: combineRgb(255, 255, 255), // White text
			bgcolor: combineRgb(0, 255, 0), // Green background
		},
		callback: async (feedback, context) => {
			const fontName = (await context.parseVariablesInString(String(feedback.options.fontName))).toLowerCase().trim()
			const isFontInstalled = self.fonts.some((font) => font.toLowerCase() === fontName)

			const checkType = feedback.options.checkType

			if (checkType === 'installed' && isFontInstalled) {
				return true
			}
			if (checkType === 'not_installed' && !isFontInstalled) {
				return true
			}

			return false
		},
	}

	feedbacks.cpuLoad = {
		type: 'advanced',
		name: 'CPU Load %',
		description: 'Color changes based on system CPU usage',
		options: [],
		callback: async () => {
			const cpuLoad = self.systemInfo.currentLoad.currentLoad

			if (cpuLoad >= 80) {
				return { bgcolor: combineRgb(255, 0, 0) } // Red
			} else if (cpuLoad >= 50) {
				return { bgcolor: combineRgb(255, 255, 0) } // Yellow
			} else {
				return { bgcolor: combineRgb(0, 128, 0) } // Green
			}
		},
	}
	feedbacks.cpuTemp = {
		type: 'boolean',
		name: 'CPU Temperature',
		description: 'Trigger if CPU temperature exceeds threshold',
		options: [
			{
				type: 'number',
				label: 'Temperature Threshold (°C)',
				id: 'threshold',
				default: 80,
				min: 30,
				max: 120,
			},
		],
		defaultStyle: {
			color: combineRgb(255, 255, 255), // White text
			bgcolor: combineRgb(255, 0, 0), // Red background
		},
		callback: async (feedback) => {
			const threshold = Number(feedback.options.threshold)
			const temp = self.systemInfo.cpuTemp.main ?? self.systemInfo.cpuTemp.chipset ?? null

			if (typeof temp !== 'number' || isNaN(temp)) {
				return false // or undefined
			} else if (temp < 0) {
				return false // Invalid temperature reading
			} else {
				const roundedTemp = Math.round(temp) // round to nearest integer
				if (!isNaN(threshold) && roundedTemp >= threshold) {
					return true // CPU temperature exceeds threshold
				}
			}

			return false // CPU temperature is below threshold
		},
	}

	feedbacks.diskUsage = {
		type: 'boolean',
		name: 'Disk Usage Threshold',
		description: 'Triggers if disk usage is above a threshold',
		options: [
			{
				type: 'dropdown',
				id: 'mount',
				label: 'Disk Mount',
				default: self.CHOICES_DISKS?.[0]?.id,
				choices: self.CHOICES_DISKS,
			},
			{
				type: 'number',
				id: 'threshold',
				label: 'Usage Threshold (%)',
				default: 90,
				min: 1,
				max: 100,
			},
		],
		defaultStyle: {
			color: combineRgb(255, 255, 255), // White text
			bgcolor: combineRgb(255, 0, 0), // Red background
		},
		callback: async (feedback) => {
			const mount = feedback.options.mount
			const threshold = Number(feedback.options.threshold)
			const disk = self.systemInfo.disks?.find((d) => d.mount === mount)

			if (!disk || typeof disk.use !== 'number') return false

			return disk.use >= threshold
		},
	}

	feedbacks.gpuLoad = {
		type: 'advanced',
		name: 'GPU Load %',
		description: 'Show color based on GPU utilization percent',
		options: [],
		callback: async () => {
			const gpu = self.systemInfo.gpu?.controllers?.[0]

			if (!gpu || typeof gpu.utilizationGpu !== 'number') {
				// Always return a valid result object (e.g., gray background)
				return { bgcolor: combineRgb(128, 128, 128), color: combineRgb(255, 255, 255) }
			}

			const load = gpu.utilizationGpu

			if (load >= 80) {
				return { bgcolor: combineRgb(255, 0, 0), color: combineRgb(255, 255, 255) } // Red
			} else if (load >= 50) {
				return { bgcolor: combineRgb(255, 255, 0), color: combineRgb(0, 0, 0) } // Yellow
			} else {
				return { bgcolor: combineRgb(0, 128, 0), color: combineRgb(255, 255, 255) } // Green
			}
		},
	}
	feedbacks.memoryUsage = {
		type: 'advanced',
		name: 'Memory Usage %',
		description: 'Color changes based on system memory usage',
		options: [],
		callback: async () => {
			const memoryUsage = (self.systemInfo.memory.used / self.systemInfo.memory.total) * 100

			if (memoryUsage >= 80) {
				return { bgcolor: combineRgb(255, 0, 0) } // Red
			} else if (memoryUsage >= 50) {
				return { bgcolor: combineRgb(255, 255, 0) } // Yellow
			} else {
				return { bgcolor: combineRgb(0, 128, 0) } // Green
			}
		},
	}

	feedbacks.networkActivityLoad = {
		type: 'advanced',
		name: 'Network Activity/Load',
		description: 'Indicates network activity/load on the selected interface',
		options: [
			{
				type: 'dropdown',
				label: 'Network Interface',
				id: 'nic',
				default: self.CHOICES_NIC?.[0]?.id,
				choices: self.CHOICES_NIC,
			},
		],
		callback: async (feedback) => {
			const iface = feedback.options.iface
			const nic = self.systemInfo.networkStats.find((n) => n.iface === iface)

			if (!nic || nic.utilization == null) {
				// Always return a valid result object
				return { bgcolor: combineRgb(128, 128, 128) }
			}

			if (nic.utilization >= 80) {
				return { bgcolor: combineRgb(255, 0, 0) }
			} else if (nic.utilization >= 50) {
				return { bgcolor: combineRgb(255, 255, 0), color: combineRgb(0, 0, 0) }
			} else {
				return { bgcolor: combineRgb(0, 128, 0) }
			}
		},
	}

	self.setFeedbackDefinitions(feedbacks)
}
