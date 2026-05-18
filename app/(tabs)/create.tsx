import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import { Alert, Button, Platform, Text, TextInput, View } from "react-native";
import { useAuth } from "../../src/context/AuthProvider";
import { db } from "../../src/services/firebaseConfig";
import { Evento } from "../../src/types";

export default function CreateScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState("");

  // Estados para UX nativa de Fecha y Hora
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = async () => {
    if (!titulo || !descripcion || !ubicacion) {
      return Alert.alert("Error", "Llena todos los campos de texto");
    }

    try {
      // Formateo simple sin librerías extra (YYYY-MM-DD y HH:mm)
      const fechaFormat = date.toISOString().split("T")[0];
      const horaFormat = date.toTimeString().split(" ")[0].substring(0, 5);

      // Usamos la interfaz Evento de la Fase 2
      const nuevoEvento: Omit<Evento, "id"> = {
        titulo,
        descripcion,
        fecha: fechaFormat,
        hora: horaFormat,
        ubicacion,
        creadorId: user!.uid,
        asistentes: [], // Inicia vacío
      };

      await addDoc(collection(db, "eventos"), nuevoEvento);

      Alert.alert("Éxito", "Evento creado correctamente");
      router.replace("/(tabs)"); // Regresar al feed
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Título</Text>
      <TextInput
        value={titulo}
        onChangeText={setTitulo}
        style={{ borderWidth: 1, padding: 10, marginBottom: 15 }}
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 15,
        }}
      >
        <View style={{ flex: 1, marginRight: 5 }}>
          <Button
            title={`Fecha: ${date.toISOString().split("T")[0]}`}
            onPress={() => setShowDatePicker(true)}
            color="#555"
          />
        </View>
        <View style={{ flex: 1, marginLeft: 5 }}>
          <Button
            title={`Hora: ${date.toTimeString().split(" ")[0].substring(0, 5)}`}
            onPress={() => setShowTimePicker(true)}
            color="#555"
          />
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(Platform.OS === "ios");
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display="default"
          onChange={(event, selectedDate) => {
            setShowTimePicker(Platform.OS === "ios");
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <Text>Ubicación</Text>
      <TextInput
        value={ubicacion}
        onChangeText={setUbicacion}
        style={{ borderWidth: 1, padding: 10, marginBottom: 15 }}
      />

      <Text>Descripción</Text>
      <TextInput
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
        numberOfLines={3}
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 20,
          textAlignVertical: "top",
        }}
      />

      <Button title="Guardar Evento" onPress={handleSave} />
    </View>
  );
}
