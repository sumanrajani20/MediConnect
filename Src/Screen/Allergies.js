import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  TextInput,
  Image
} from 'react-native';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const initialCategories = [
  { title: 'Fruit', items: ['Apple', 'Banana', 'Strawberry'] },
  { title: 'Vegetables', items: ['Spinach', 'Carrot', 'Broccoli'] },
  { title: 'Grains', items: ['Wheat', 'Oats', 'Rice'] },
  { title: 'Nuts & Seeds', items: ['Peanut', 'Almond', 'Chia Seeds'] },
  { title: 'Animal products', items: ['Milk', 'Cheese', 'Eggs'] },
  { title: 'Meat', items: ['Chicken', 'Beef', 'Lamb'] }
];

const AllergiesScreen = ({ navigation }) => {
  const [categories, setCategories] = React.useState(initialCategories);
  const [openSections, setOpenSections] = React.useState({});
  const [inputValues, setInputValues] = React.useState({});
  const [showInputs, setShowInputs] = React.useState({});
  const [newCategoryInput, setNewCategoryInput] = React.useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = React.useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Allergies',
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: '#00C2D4',
      },
      headerTintColor: '#fff',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingLeft: 10 }}>
          <Image
            source={require('../../assets/custom-arrow.png')}
            style={{ width: 20, height: 20, resizeMode: 'contain' }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const toggleSection = (title) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleAddAllergy = (categoryTitle) => {
    const newAllergy = inputValues[categoryTitle]?.trim();
    if (!newAllergy) return;

    setCategories((prev) =>
      prev.map((cat) =>
        cat.title === categoryTitle
          ? { ...cat, items: [...cat.items, newAllergy] }
          : cat
      )
    );
    setInputValues((prev) => ({ ...prev, [categoryTitle]: '' }));
    setShowInputs((prev) => ({ ...prev, [categoryTitle]: false }));
  };

  const handleDeleteAllergy = (categoryTitle, itemIndex) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.title === categoryTitle
          ? {
              ...cat,
              items: cat.items.filter((_, idx) => idx !== itemIndex)
            }
          : cat
      )
    );
  };

  const handleAddNewCategory = () => {
    const title = newCategoryInput.trim();
    if (!title) return;

    const alreadyExists = categories.some(
      (cat) => cat.title.toLowerCase() === title.toLowerCase()
    );
    if (alreadyExists) return;

    setCategories((prev) => [...prev, { title, items: [] }]);
    setOpenSections((prev) => ({ ...prev, [title]: true }));
    setShowInputs((prev) => ({ ...prev, [title]: false }));
    setInputValues((prev) => ({ ...prev, [title]: '' }));
    setNewCategoryInput('');
    setShowNewCategoryInput(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 🧠 Custom Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🙂</Text>
        <Text style={styles.headerTitle}>Allergies</Text>
        <Text style={styles.headerSubtitle}>
          Avoid reactions by identifying allergies in consultation
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {categories.map((category) => (
          <View key={category.title} style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.dropdownHeader}
              onPress={() => toggleSection(category.title)}
            >
              <Text style={styles.dropdownTitle}>{category.title}</Text>
              <Text style={styles.arrow}>
                {openSections[category.title] ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {openSections[category.title] && (
              <View style={styles.dropdownItems}>
                {category.items.map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <Text style={styles.dropdownItem}>{item}</Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteAllergy(category.title, idx)}
                    >
                      <Text style={styles.cancel}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                {showInputs[category.title] && (
                  <View style={styles.inputRow}>
                    <TextInput
                      value={inputValues[category.title] || ''}
                      onChangeText={(text) =>
                        setInputValues((prev) => ({
                          ...prev,
                          [category.title]: text
                        }))
                      }
                      placeholder="Enter allergy name"
                      style={styles.input}
                    />
                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={() => handleAddAllergy(category.title)}
                    >
                      <Text style={styles.addText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.innerAddButton}
                  onPress={() =>
                    setShowInputs((prev) => ({
                      ...prev,
                      [category.title]: true
                    }))
                  }
                >
                  <Text style={styles.innerAddButtonText}>+ Add Allergy</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {showNewCategoryInput && (
          <View style={styles.newCategoryRow}>
            <TextInput
              value={newCategoryInput}
              onChangeText={setNewCategoryInput}
              placeholder="Enter new category title"
              style={styles.input}
            />
            <TouchableOpacity
              style={styles.addBtn}
              onPress={handleAddNewCategory}
            >
              <Text style={styles.addText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setShowNewCategoryInput(true)}
      >
        <Text style={styles.floatingButtonText}>Add More</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 100 },
  header: {
    backgroundColor: '#33D3E0',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center'
  },
  headerEmoji: { fontSize: 30 },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginTop: 4
  },
  dropdownContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 10
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15
  },
  dropdownTitle: { fontSize: 16, fontWeight: 'bold' },
  arrow: { fontSize: 16, color: '#555' },
  dropdownItems: {
    paddingHorizontal: 15,
    paddingBottom: 10
  },
  dropdownItem: {
    fontSize: 14,
    paddingVertical: 4,
    color: '#333',
    flex: 1
  },
  innerAddButton: {
    marginTop: 10,
    backgroundColor: '#33D3E0',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  innerAddButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#33D3E0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
    elevation: 4
  },
  floatingButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6
  },
  cancel: {
    marginLeft: 10,
    color: 'red',
    fontWeight: 'bold'
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  newCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  addBtn: {
    backgroundColor: '#33D3E0',
    marginLeft: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6
  },
  addText: {
    color: 'white',
    fontWeight: 'bold'
  }
});

export default AllergiesScreen;