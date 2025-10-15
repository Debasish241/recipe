import { View, Text, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { API_URL } from "../../constants/api";
import { MealAPI } from "../../services/mealAPI";
import LoadingSpinner  from "../../components/LoadingSpinner";

const RecipeDetailScreen = () => {
  const { id: recipeId } = useLocalSearchParams();
  const [recipe, setRecipe] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useUser();
  const userId = user?.id;

  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        const response = await fetch(`${API_URL}/favorites/${userId}`);
        const favorites = await response.json();
        const isRecipeSaved = favorites.some(
          (fav) => fav.recipeId === parseInt(recipeId)
        );
        setIsSaved(isRecipeSaved);
      } catch (error) {
        console.error("Error checking if recipe is saved:", error);
      }
    };

    const loadRecipeDetail = async () => {
      setLoading(true);
      try {
        const mealData = await MealAPI.getMealById(recipeId); // ✅ fixed function name
        if (mealData) {
          const transformedRecipe = MealAPI.transformMealData(mealData);

          const recipeWithVideo = {
            ...transformedRecipe,
            youtubeUrl: mealData.strYoutube || null,
          };

          setRecipe(recipeWithVideo);
        }
      } catch (error) {
        console.error("Error loading recipe details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      checkIfSaved();
      loadRecipeDetail();
    }
  }, [recipeId, userId]);

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const videoId = url.split("v=")[1];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const handleToggleSave = async () => {
    setIsSaving(true);
    try {
      if (isSaved) {
        const response = await fetch(
          `${API_URL}/favorites/${userId}/${recipeId}`, // ✅ fixed interpolation
          {
            method: "DELETE",
          }
        );
        if (!response.ok) throw new Error("Failed to remove recipe");
        setIsSaved(false);
      } else {
        const response = await fetch(`${API_URL}/favorites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            recipeId: parseInt(recipeId),
            title: recipe.title,
            image: recipe.image,
            cookTime: recipe.cookTime,
            servings: recipe.servings,
          }),
        });

        if (!response.ok) throw new Error("Failed to save recipe");
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error toggling recipe save:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading recipe details..." />; // ✅ fixed

  return (
    <View>
      <Text>{recipe?.title || "Recipe Details"}</Text>
      {/* You can render more recipe info here later */}
    </View>
  );
};

export default RecipeDetailScreen;
