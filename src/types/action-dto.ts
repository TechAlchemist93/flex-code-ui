export interface ActionDTO {
  name: string;
  type: string;
  source: 'API';
  params: Record<string, any>;
}

export function convertToActionDTO(action: FunctionDetails): ActionDTO {
  // Initialize params map with appropriate default values
  const params: Record<string, any> = {};
  
  // Convert each FunctionParam to a key-value pair in the params map
  // For required params, initialize with empty string to trigger validation
  // For optional params, initialize with null
  action.params.forEach(param => {
    params[param.name] = param.nullable ? null : '';
  });

  return {
    name: action.name,
    type: action.type,
    source: 'API',
    params
  };
}
// Function to validate if all required params are set
export function validateActionDTO(action: ActionDTO, functionDetails: FunctionDetails): boolean {
  // Get all required param names (where nullable is false)
  const requiredParams = functionDetails.params
    .filter(param => !param.nullable)
    .map(param => param.name);

  // Check if all required params have non-empty values
  return requiredParams.every(paramName => {
    const value = action.params[paramName];
    return value !== null && value !== undefined && value !== '';
  });
}

// Function to set a param value and validate it
export function setActionParam(
  action: ActionDTO, 
  functionDetails: FunctionDetails,
  paramName: string, 
  value: string
): { action: ActionDTO; isValid: boolean } {
  // Create a new action object with updated params
  const updatedAction = {
    ...action,
    params: {
      ...action.params,
      [paramName]: value === '' && functionDetails.params.find(p => p.name === paramName)?.nullable 
        ? null 
        : value
    }
  };

  // Validate the updated action
  const isValid = validateActionDTO(updatedAction, functionDetails);

  return { action: updatedAction, isValid };
}