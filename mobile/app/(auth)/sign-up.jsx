import { View, Text, Alert } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useSignUp } from "@clerk/clerk-expo";

const signUpScreen = () => {
  const router = useRouter();
  const { isLoaded, signUp } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Please fill in all fields");
    }
    if (password.length < 6) {
      return Alert.alert("Error", "password must be at least 6 characcters");
    }
    if (!isLoaded) return;

    setLoading(true);

    try {
      
    } catch (error) {
      
    }
  };

  return (
    <View>
      <Text>signUpScreen</Text>
    </View>
  );
};

export default signUpScreen;
