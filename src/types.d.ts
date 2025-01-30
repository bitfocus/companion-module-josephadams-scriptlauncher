// types.d.ts

interface systemInfo {
	cpu: {
		manufacturer: string
		brand: string
		speed: number
		cores: number
	}
	currentLoad: {
		avgLoad: number
		currentLoad: number
		currentLoadUser: number
		currentLoadSystem: number
		currentLoadIdle: number
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
	}[]
}
