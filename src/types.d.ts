// types.d.ts

interface DeviceInfo {
	deviceInternalTemperatureC: number
	name: string
	firmwareVersion: string
	firmwareBuild: string
}

interface Battery {
	batteryBayTempC: number
	slotState: string
	stateOfChargePercent: number
	timeRemainingSeconds: number
	errorMsg: string
}

interface ChargerStatus {
	deviceStatus: string
	batteries: { [key: string]: Battery } // String keys for the batteries object
}
