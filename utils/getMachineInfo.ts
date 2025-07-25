import * as Device from "expo-device";
import Constants from "expo-constants";
import * as Network from "expo-network";

export const getMachineInfo = async () => {
  const networkInfo = await Network.getIpAddressAsync();

  return {
    brand: Device.brand ?? null,
    modelName: Device.modelName ?? null,
    designName: Device.designName ?? null,
    productName: Device.productName ?? null,
    manufacturer: Device.manufacturer ?? null,
    osName: Device.osName ?? null,
    osVersion: Device.osVersion ?? null,
    platformApiLevel: Device.platformApiLevel ?? null,
    totalMemory: Device.totalMemory ?? null,
    deviceType: Device.deviceType ?? null,
    supportedCpuArchitectures: Device.supportedCpuArchitectures ?? [],
    deviceName: Device.deviceName ?? null,
    ipAddress: networkInfo ?? null,
    deviceYearClass: Device.deviceYearClass ?? null,
    isDevice: Device.isDevice ?? null,
    expoVersion: Constants.expoVersion ?? null,
    expoConfig: Constants.expoConfig?.name ?? null,
  };
};
