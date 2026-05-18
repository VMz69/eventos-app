import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { useCallback, useState } from "react";
import { Alert, Button, Platform, Text, TextInput, View } from "react-native";
import { useAuth } from "../../src/context/AuthProvider";
import { db } from "../../src/services/firebaseConfig";
import { Evento } from "../../src/types";

export default function CreateScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState("");

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // useFocusEffect se ejecuta SIEMPRE que la pestaña se vuelve activa
  useFocusEffect(
    useCallback(() => {
      if (!id) {
        // Si no hay ID en la URL, limpiamos obligatoriamente el formulario para modo CREACIÓN
        setTitulo("");
        setDescripcion("");
        setUbicacion("");
        setDate(new Date());
      } else {
        // Si hay ID, cargamos los datos del evento para modo EDICIÓN
        const loadEvento = async () => {
          const docSnap = await getDoc(doc(db, "eventos", id as string));
          if (docSnap.exists()) {
            const data = docSnap.data() as Evento;
            setTitulo(data.titulo);
            setDescripcion(data.descripcion);
            setUbicacion(data.ubicacion);
            setDate(new Date(`${data.fecha}T${data.hora}:00`));
          }
        };
        loadEvento();
      }
    }, [id]),
  );

  const handleSave = async () => {
    if (!titulo || !descripcion || !ubicacion) {
      return Alert.alert("Error", "Llena todos los campos de texto");
    }

    try {
      const fechaFormat = date.toISOString().split("T")[0];
      const horaFormat = date.toTimeString().split(" ")[0].substring(0, 5);

      if (id) {
        await updateDoc(doc(db, "eventos", id as string), {
          titulo,
          descripcion,
          fecha: fechaFormat,
          hora: horaFormat,
          ubicacion,
        });
        Alert.alert("Éxito", "Evento actualizado");
        router.replace("/(tabs)"); // replace limpia los parámetros de la URL para evitar ciclos
      } else {
        const nuevoEvento: Omit<Evento, "id"> = {
          titulo,
          descripcion,
          fecha: fechaFormat,
          hora: horaFormat,
          ubicacion,
          creadorId: user!.uid,
          asistentes: [],
        };
        await addDoc(collection(db, "eventos"), nuevoEvento);
        Alert.alert("Éxito", "Evento creado");
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 15 }}>
        {id ? "Editar Evento" : "Crear Evento"}
      </Text>

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
          onChange={(e, d) => {
            setShowDatePicker(Platform.OS === "ios");
            if (d) setDate(d);
          }}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display="default"
          onChange={(e, d) => {
            setShowTimePicker(Platform.OS === "ios");
            if (d) setDate(d);
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

      <Button
        title={id ? "Actualizar Evento" : "Guardar Evento"}
        onPress={handleSave}
      />
    </View>
  );
}
