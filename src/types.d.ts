// types.d.ts

interface systemInfo {
	cpu: {
		manufacturer: string
		brand: string
		speed: number
		cores: number
	}
	cpuTemp: {
		main: number | null
		max: number | null
		cores: number[]
		socket: number[]
		chipset?: number | null
	}
	currentLoad: {
		avgLoad: number
		currentLoad: number
		currentLoadUser: number
		currentLoadSystem: number
		currentLoadIdle: number
	}
	disks: {
		fs: string
		type: string
		size: number
		used: number
		available: number
		use: number
		mount: string
		rw: boolean
	}[]
	gpu: {
		controllers: {
			vendor: string
			model: string
			bus: string
			vramDynamic?: boolean
			vram?: number | null
			deviceId?: string
			vendorId?: string
			external?: boolean
			cores?: string
			metalVersion?: string
			utilizationGpu?: number // This is reported on some systems (mostly NVIDIA on Windows/Linux)
		}[]
		displays: {
			vendor?: string
			vendorId?: string
			model?: string
			productionYear?: string
			serial?: string
			displayId?: string
			main?: boolean
			builtin?: boolean
			connection?: string
			resolutionX?: number
			resolutionY?: number
			currentResX?: number
			currentResY?: number
			currentRefreshRate?: number
			positionX?: number
			positionY?: number
			pixelDepth?: number
		}[]
	}
	memory: {
		total: number
		free: number
		used: number
		active: number
		available: number
	}
	networkInterfaces: {
		iface: string
		ifaceName: string
		ip4: string
		ip4subnet: string
		ip6: string
		ip6subnet: string
		mac: string
		internal: boolean
		virtual: boolean
		operstate: string
		type: string
		duplex: string
		mtu: number
		speed: number
		dhcp: boolean
	}[]
	networkStats: {
		iface: string
		rx_bytes: number
		rx_errors: number
		rx_sec: number
		rx_sec_mb: number
		tx_bytes: number
		tx_errors: number
		tx_sec: number
		tx_sec_mb: number
		utilization?: number
	}[]
}
