import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import Recipes, { Recipe } from "./Recipes";

const API_KEY =
  "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";

export default function Input() {
  const [ingredients, setIngredients] = useState(
    "200g spaghetti 100g ground beef 1 onion 2 cloves garlic 1 can tomato sauce"
  );
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

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

      <TextInput
        style={styles.input}
        placeholder="Type your prompt here"
        value={ingredients}
        onChangeText={setIngredients}
        multiline
      />

      <Button title="Submit" onPress={sendToGenAI} />

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={styles.loading}
        />
      ) : (
        <ScrollView style={styles.responseContainer}>
          <Recipes recipes={recipes} />
        </ScrollView>
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
