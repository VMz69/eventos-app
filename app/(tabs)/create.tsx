import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { useCallback, useState } from "react";
import {
  Alert,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../../src/context/AuthProvider";
import { db } from "../../src/services/firebaseConfig";
import { Evento } from "../../src/types";
import {
  esFechaFutura,
  formatFecha,
  formatHora,
} from "../../src/utils/formatters";

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
  const [guardando, setGuardando] = useState(false);

  // Errores por campo
  const [errores, setErrores] = useState<Record<string, string>>({});

  useFocusEffect(
    useCallback(() => {
      if (!id) {
        setTitulo("");
        setDescripcion("");
        setUbicacion("");
        setDate(new Date());
        setErrores({});
      } else {
        const loadEvento = async () => {
          const docSnap = await getDoc(doc(db, "eventos", id as string));
          if (docSnap.exists()) {
            const data = docSnap.data() as Evento;
            setTitulo(data.titulo);
            setDescripcion(data.descripcion);
            setUbicacion(data.ubicacion);
            setDate(new Date(`${data.fecha}T${data.hora}:00`));
            setErrores({});
          }
        };
        loadEvento();
      }
    }, [id]),
  );

  const validar = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!titulo.trim()) {
      nuevosErrores.titulo = "El título es obligatorio.";
    } else if (titulo.trim().length < 3) {
      nuevosErrores.titulo = "El título debe tener al menos 3 caracteres.";
    }

    if (!ubicacion.trim()) {
      nuevosErrores.ubicacion = "La ubicación es obligatoria.";
    }

    if (!descripcion.trim()) {
      nuevosErrores.descripcion = "La descripción es obligatoria.";
    } else if (descripcion.trim().length < 10) {
      nuevosErrores.descripcion =
        "La descripción debe tener al menos 10 caracteres.";
    }

    if (!esFechaFutura(date)) {
      nuevosErrores.fecha = "La fecha del evento no puede ser en el pasado.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSave = async () => {
    if (!validar()) return;
    if (guardando) return;

    setGuardando(true);
    try {
      const fechaFormat = date.toISOString().split("T")[0];
      const horaFormat = date.toTimeString().split(" ")[0].substring(0, 5);

      if (id) {
        await updateDoc(doc(db, "eventos", id as string), {
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          fecha: fechaFormat,
          hora: horaFormat,
          ubicacion: ubicacion.trim(),
        });
        Alert.alert("Éxito", "Evento actualizado correctamente.");
        router.replace("/(tabs)");
      } else {
        const nuevoEvento: Omit<Evento, "id"> = {
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          fecha: fechaFormat,
          hora: horaFormat,
          ubicacion: ubicacion.trim(),
          creadorId: user!.uid,
          asistentes: [],
          createdAt: new Date().toISOString(),
        };
        await addDoc(collection(db, "eventos"), nuevoEvento);
        Alert.alert("Éxito", "Evento creado correctamente.");
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setGuardando(false);
    }
  };

  const fechaDisplay = formatFecha(date.toISOString().split("T")[0]);
  const horaDisplay = formatHora(
    date.toTimeString().split(" ")[0].substring(0, 5),
  );

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.titulo}>{id ? "Editar Evento" : "Crear Evento"}</Text>

      {/* Título */}
      <Text style={styles.label}>Título *</Text>
      <TextInput
        value={titulo}
        onChangeText={(t) => {
          setTitulo(t);
          if (errores.titulo) setErrores((e) => ({ ...e, titulo: "" }));
        }}
        style={[styles.input, errores.titulo ? styles.inputError : null]}
        placeholder="Ej: Reunión de bienvenida"
        maxLength={80}
      />
      {errores.titulo ? (
        <Text style={styles.errorText}>{errores.titulo}</Text>
      ) : null}

      {/* Fecha y Hora */}
      <View style={styles.row}>
        <View style={styles.halfCol}>
          <Text style={styles.label}>Fecha *</Text>
          <Button
            title={fechaDisplay}
            onPress={() => setShowDatePicker(true)}
            color={errores.fecha ? "#d9534f" : "#555"}
          />
          {errores.fecha ? (
            <Text style={styles.errorText}>{errores.fecha}</Text>
          ) : null}
        </View>
        <View style={styles.halfColRight}>
          <Text style={styles.label}>Hora *</Text>
          <Button
            title={horaDisplay}
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
          minimumDate={new Date()}
          onChange={(e, d) => {
            setShowDatePicker(Platform.OS === "ios");
            if (d) {
              setDate(d);
              if (errores.fecha) setErrores((prev) => ({ ...prev, fecha: "" }));
            }
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

      {/* Ubicación */}
      <Text style={[styles.label, { marginTop: 10 }]}>Ubicación *</Text>
      <TextInput
        value={ubicacion}
        onChangeText={(t) => {
          setUbicacion(t);
          if (errores.ubicacion) setErrores((e) => ({ ...e, ubicacion: "" }));
        }}
        style={[styles.input, errores.ubicacion ? styles.inputError : null]}
        placeholder="Ej: Salón A, Universidad"
      />
      {errores.ubicacion ? (
        <Text style={styles.errorText}>{errores.ubicacion}</Text>
      ) : null}

      {/* Descripción */}
      <Text style={styles.label}>Descripción *</Text>
      <TextInput
        value={descripcion}
        onChangeText={(t) => {
          setDescripcion(t);
          if (errores.descripcion)
            setErrores((e) => ({ ...e, descripcion: "" }));
        }}
        multiline
        numberOfLines={4}
        style={[
          styles.input,
          styles.multiline,
          errores.descripcion ? styles.inputError : null,
        ]}
        placeholder="Describe de qué trata el evento..."
      />
      {errores.descripcion ? (
        <Text style={styles.errorText}>{errores.descripcion}</Text>
      ) : null}

      <View style={{ marginTop: 20, marginBottom: 40 }}>
        <Button
          title={
            guardando
              ? "Guardando..."
              : id
                ? "Actualizar Evento"
                : "Guardar Evento"
          }
          onPress={handleSave}
          color="#4fb0b7"
          disabled={guardando}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  titulo: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 4, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 4,
    fontSize: 15,
    backgroundColor: "#fff",
  },
  inputError: { borderColor: "#d9534f" },
  multiline: { textAlignVertical: "top", minHeight: 80 },
  errorText: { color: "#d9534f", fontSize: 12, marginBottom: 10 },
  row: { flexDirection: "row", marginBottom: 10 },
  halfCol: { flex: 1, marginRight: 6 },
  halfColRight: { flex: 1, marginLeft: 6 },
});
