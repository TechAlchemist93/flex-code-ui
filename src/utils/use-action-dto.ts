import { createSignal } from 'solid-js';
import { convertToActionDTO, setActionDTOParam, validateActionDTO } from '../types/action-dto';

export function useActionDTO(functionDetails: FunctionDetails) {
  const [actionDTO, setActionDTO] = createSignal(convertToActionDTO(functionDetails));
  const [isValid, setIsValid] = createSignal(false);

  const setParamValue = (paramName: string, value: any) => {
    const result = setActionDTOParam(actionDTO(), functionDetails, paramName, value);
    setActionDTO(result.action);
    setIsValid(result.isValid);
    return result.isValid;
  };

  const getEmptyRequiredParams = () => {
    const requiredParams = functionDetails.params
      .filter(param => !param.nullable)
      .map(param => param.name);

    return requiredParams.filter(paramName => actionDTO().params[paramName] === null);
  };

  return {
    actionDTO,
    isValid,
    setParamValue,
    getEmptyRequiredParams
  };
}