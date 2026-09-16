import { SymbolView, type SFSymbol } from "expo-symbols";
import { FC } from "react";
import { Platform } from "react-native";

interface PlatformIconProps {
  iosName: SFSymbol;
  fallback: React.ReactNode;
  color: string;
  size?: number;
}

export const PlatformIcon: FC<PlatformIconProps> = ({
  iosName,
  fallback,
  color,
  size = 22,
}) => {
  if (Platform.OS === "ios") {
    return (
      <SymbolView
        name={iosName}
        tintColor={color}
        style={{ width: size, height: size }}
      />
    );
  }

  return <>{fallback}</>;
};
