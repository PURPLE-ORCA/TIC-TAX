import { SafeScreen } from "@/src/components/layout/SafeScreen";
import { Text } from "@/src/components/ui/text";
import React from "react";

const index = () => {
  return <SafeScreen>
    <Text className="text-red-500">Hello, World!</Text>
  </SafeScreen>;
};

export default index;
