import type { CompanionVariableDefinition, CompanionVariableValues } from '@companion-module/base'

import type { ScriptLauncherInstance } from './main.js'

export function UpdateVariableDefinitions(self: ScriptLauncherInstance): void {
	const variables: CompanionVariableDefinition[] = []

	variables.push({ variableId: 'connected', name: 'Connected to ScriptLauncher' })

	self.setVariableDefinitions(variables)
}

export function CheckVariables(self: ScriptLauncherInstance): void {
	const variableValues: CompanionVariableValues = {}

	variableValues.connected = self.connected ? 'Connected' : 'Disconnected'

	self.setVariableValues(variableValues)
}
