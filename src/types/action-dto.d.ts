interface ActionDTO {
  name: string;
  type: string;
  source: 'API';
  params: Record<string, any>;
}

export function convertToActionDTO(action: FunctionDetails): ActionDTO {
  // Initialize params map with null values
  const params: Record<string, any> = {};
  
  // Convert each FunctionParam to a key-value pair in the params map
  action.params.forEach(param => {
    params[param.name] = null;
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

  // Check if all required params have non-null values
  return requiredParams.every(paramName => action.params[paramName] !== null);
}

// Function to set a param value and validate it
export function setActionDTOParam(
  action: ActionDTO,
  functionDetails: FunctionDetails,
  paramName: string,
  value: any
): { action: ActionDTO; isValid: boolean } {
  const newAction = {
    ...action,
    params: {
      ...action.params,
      [paramName]: value
    }
  };

  return {
    action: newAction,
    isValid: validateActionDTO(newAction, functionDetails)
  };
}