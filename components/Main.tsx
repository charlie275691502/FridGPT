import React, { useEffect, useState } from "react";
// import { CVImage, InferenceEngine } from "inferencejs";
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker"; // Import the image picker
import Recipes, { Recipe } from "./Recipes";

const API_KEY =
  "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";

export default function Input() {
  const [ingredients, setIngredients] = useState(
    "200g spaghetti 100g ground beef 1 onion 2 cloves garlic 1 can tomato sauce"
  );
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [workerId, setWorkerId] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string>(""); // State for the selected image

  const handleCameraUpload = async () => {
    // Request permission to access the camera
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermission.granted) {
      alert("Permission to access the camera is required!");
      return;
    }
    // Launch the camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri); // Set the captured image URI
      console.log("Captured image URI:", result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    } else {
      console.log("Camera action canceled.");
    }
  };
  const handleImageUpload = async () => {
    // Request permission to access the media library
    const galleryPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!galleryPermission.granted) {
      alert("Permission to access the gallery is required!");
      return;
    }

    // Launch the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri); // Set the selected image URI
      console.log("Selected image URI:", result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    } else {
      console.log("Image selection canceled.");
    }
  };

  const uploadImage = async (imageFile: string) => {
    const formData = new FormData();
    formData.append("image", {
      uri: imageFile,
      name: "Test.PNG",
      type: "image/png",
    } as any);

    try {
      const response = await fetch("http://192.168.18.2:5010/detect", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      // const result = await response.text(); // or .text() if it's not JSON
      const result = await response.json();
      const ingredientNames = result
        .map((item: { name: any }) => item.name)
        .join(", ");
      console.log("Detection result:", ingredientNames);
      setIngredients(ingredientNames);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const sendToGenAI = async () => {
    if (!ingredients.trim()) return;

    setLoading(true);

    try {
      const result = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            model: "mistralai/mistral-7b-instruct",
            messages: [
              {
                role: "user",
                content: `Given a list of ingredients: ${ingredients}
        
              Please generate the recipes in the following format:
              [{
                "recipe_name": "Recipe Name",
                "ingredients": ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
                "instructions": ["Step 1", "Step 2", "Step 3"],
                "prep_time": "Preparation time",
                "difficulty": "Difficulty level"
              },{
                "recipe_name": "Recipe Name 2",
                "ingredients": ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
                "instructions": ["Step 1", "Step 2", "Step 3"],
                "prep_time": "Preparation time",
                "difficulty": "Difficulty level"
              }
                ]
              Please only give the JSON response without any additional text or explanation.
              Make sure to include the recipe name, ingredients, instructions, prep time, and difficulty level.`,
              },
            ],
          }),
        }
      );

      const data = await result.json();
      console.log("API response:", data); // 👈 Log the whole response

      if (!result.ok) {
        const error = await result.text();
        console.error("API error:", error);
        console.log(`Error: ${error}`);
        return;
      }

      const reply =
        data.choices?.[0]?.message?.content ?? "No response from model.";
      console.log(reply);
      if (reply) {
        try {
          const parsedResponse = JSON.parse(reply);

          setRecipes(parsedResponse);
        } catch (error) {
          console.log("Parsing error:", error); // 👈 Log parsing errors
          setRecipes([]); // Reset recipes in case of error
        }
      }
    } catch (err) {
      console.error(err);
      console.log("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>FridGPT</Text>

      {selectedImage && recipes.length == 0 ? (
        <Image
          source={{ uri: selectedImage }}
          style={{ width: 200, height: 200 }}
        />
      ) : recipes.length == 0 ? (
        <Text>No image selected</Text>
      ) : null}
      {recipes.length == 0 && (
        <>
          <Button title="Camera" onPress={handleCameraUpload} />
          <Button title="Upload Image" onPress={handleImageUpload} />

          <TextInput
            style={styles.input}
            placeholder="Type your prompt here"
            value={ingredients}
            onChangeText={setIngredients}
            multiline
          />

          <Button title="Submit" onPress={sendToGenAI} />
        </>
      )}

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={styles.loading}
        />
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <Recipes recipes={[item]} />}
          contentContainerStyle={styles.responseContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 60,
    flex: 1,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    borderRadius: 8,
    minHeight: 80,
  },
  loading: {
    marginTop: 20,
  },
  responseContainer: {
    marginTop: 20,
  },
  response: {
    fontSize: 16,
    lineHeight: 24,
  },
});
