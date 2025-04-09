import React from "react";
import { ScrollView, View, Text, FlatList, StyleSheet } from "react-native";

export interface Recipe {
  recipe_name: string;
  ingredients: string[];
  instructions: string[];
  prep_time: string;
  difficulty: string;
}

interface Props {
  recipes: Recipe[];
}

export default function App({ recipes }: Props) {
  console.log("Recipes:", recipes); // 👈 Log the recipes prop to see its structure
  return (
    <ScrollView style={styles.container}>
      {recipes.map((recipe, index) => (
        <View key={index} style={styles.recipeContainer}>
          <Text style={styles.recipeName}>{recipe.recipe_name}</Text>

          {/* Ingredients Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Ingredients:</Text>
            <FlatList
              data={recipe.ingredients}
              renderItem={({ item }) => (
                <Text style={styles.itemText}>{item}</Text>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>

          {/* Instructions Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Instructions:</Text>
            <FlatList
              data={recipe.instructions}
              renderItem={({ item }) => (
                <Text style={styles.itemText}>{item}</Text>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>

          {/* Prep Time Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Prep Time:</Text>
            <Text style={styles.itemText}>{recipe.prep_time}</Text>
          </View>

          {/* Difficulty Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Difficulty:</Text>
            <Text style={styles.itemText}>{recipe.difficulty}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// Sample recipes to pass into the component (You can replace this with actual API data)
const sampleRecipes: Recipe[] = [
  {
    recipe_name: "Spaghetti Bolognese",
    ingredients: [
      "200g Spaghetti",
      "100g ground beef",
      "1 onion",
      "2 cloves garlic",
      "1 can tomato sauce",
    ],
    instructions: [
      "Boil water and cook the spaghetti.",
      "Brown the ground beef in a pan.",
      "Add onion and garlic, and sauté.",
      "Stir in the tomato sauce and simmer.",
      "Combine cooked spaghetti with the sauce.",
    ],
    prep_time: "30 minutes",
    difficulty: "Easy",
  },
  {
    recipe_name: "Chicken Curry",
    ingredients: [
      "500g chicken",
      "2 tbsp curry powder",
      "1 onion",
      "1 can coconut milk",
      "2 cloves garlic",
    ],
    instructions: [
      "Cook chicken until browned.",
      "Sauté onions and garlic.",
      "Add curry powder and coconut milk.",
      "Simmer for 20 minutes.",
      "Serve with rice.",
    ],
    prep_time: "40 minutes",
    difficulty: "Medium",
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 10,
  },
  recipeContainer: {
    backgroundColor: "white",
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  recipeName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sectionContainer: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
  },
  itemText: {
    fontSize: 16,
    marginLeft: 10,
    marginBottom: 5,
  },
});
