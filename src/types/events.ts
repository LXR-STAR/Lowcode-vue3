export type EventType = 
  | 'click'
  | 'dblclick'
  | 'mouseenter'
  | 'mouseleave'
  | 'focus'
  | 'blur'
  | 'change'
  | 'submit'

export type ActionType = 
  | 'navigate'
  | 'openModal'
  | 'closeModal'
  | 'showMessage'
  | 'setVariable'
  | 'apiRequest'
  | 'showComponent'
  | 'hideComponent'
  | 'toggleComponent'
  | 'validateForm'
  | 'resetForm'

export interface EventAction {
  id: string
  type: ActionType
  enabled: boolean
  config: Record<string, any>
}

export interface NavigateActionConfig {
  url: string
  target: '_blank' | '_self' | '_parent' | '_top'
}

export interface OpenModalActionConfig {
  modalId: string
  width?: number
  height?: number
  title?: string
}

export interface CloseModalActionConfig {
  modalId: string
}

export interface ShowMessageActionConfig {
  type: 'success' | 'warning' | 'info' | 'error'
  message: string
  duration: number
}

export interface SetVariableActionConfig {
  variableName: string
  value: any
  valueType: 'static' | 'expression' | 'component'
  componentId?: string
  componentProp?: string
}

export interface ApiRequestActionConfig {
  dataSourceId: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  params: Record<string, any>
  onSuccess?: EventAction[]
  onError?: EventAction[]
}

export interface ShowComponentActionConfig {
  componentIds: string[]
}

export interface HideComponentActionConfig {
  componentIds: string[]
}

export interface ToggleComponentActionConfig {
  componentIds: string[]
}

export interface ValidateFormActionConfig {
  formId: string
  showErrorMessage: boolean
}

export interface ResetFormActionConfig {
  formId: string
}

export interface ComponentEvent {
  id: string
  type: EventType
  enabled: boolean
  actions: EventAction[]
  condition?: string
}

export interface EventBinding {
  componentId: string
  events: ComponentEvent[]
}
