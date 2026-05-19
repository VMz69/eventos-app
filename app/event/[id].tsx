import { useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../../src/context/AuthProvider";
import { db } from "../../src/services/firebaseConfig";
import { Comentario, Evento } from "../../src/types";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [evento, setEvento] = useState<Evento | null>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);

  // Estados para el formulario de comentario
  const [textoComentario, setTextoComentario] = useState("");
  const [calificacion, setCalificacion] = useState("5");

  useEffect(() => {
    if (!id) return;

    // 1. Escuchar el Evento
    const unsubEvento = onSnapshot(
      doc(db, "eventos", id as string),
      (docSnap) => {
        if (docSnap.exists()) {
          setEvento({ id: docSnap.id, ...docSnap.data() } as Evento);
        } else {
          // Cambiamos router.back() por router.replace() para una salida segura
          Alert.alert("Aviso", "El evento ha sido eliminado");
          router.replace("/(tabs)");
        }
      },
    );

    // 2. Escuchar los Comentarios (Sub-colección)
    const qComentarios = query(
      collection(db, "eventos", id as string, "comentarios"),
    );
    const unsubComentarios = onSnapshot(qComentarios, (snap) => {
      setComentarios(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Comentario),
      );
    });

    return () => {
      unsubEvento();
      unsubComentarios();
    };
  }, [id]);

  if (!evento || !user)
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  const isCreator = user.uid === evento.creadorId;
  const isAttending = evento.asistentes.includes(user.uid);

  const handleDelete = async () => {
    try {
      // Solo borramos el documento.
      // NO llamamos al router aquí. El onSnapshot de arriba detectará
      // el borrado instantáneamente y hará la redirección por nosotros.
      await deleteDoc(doc(db, "eventos", evento.id!));
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleRSVP = async () => {
    try {
      await updateDoc(doc(db, "eventos", evento.id!), {
        asistentes: arrayUnion(user.uid),
      });
      Alert.alert("¡Genial!", "Has confirmado tu asistencia");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handlePublicarComentario = async () => {
    const nota = parseInt(calificacion);
    if (!textoComentario || isNaN(nota) || nota < 1 || nota > 5) {
      return Alert.alert(
        "Error",
        "Ingresa texto y una calificación del 1 al 5",
      );
    }
    try {
      // 1. Buscamos el nombre del usuario en Firestore
      const userSnap = await getDoc(doc(db, "usuarios", user.uid));
      const nombreUsuario = userSnap.exists()
        ? userSnap.data().nombre
        : user.email;

      // 2. Guardamos el comentario incluyendo el nombre
      await addDoc(collection(db, "eventos", evento.id!, "comentarios"), {
        usuarioId: user.uid,
        usuarioNombre: nombreUsuario, // Inyectamos el nombre aquí
        texto: textoComentario,
        calificacion: nota,
      });

      setTextoComentario("");
      setCalificacion("5");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 5 }}>
        {evento.titulo}
      </Text>
      <Text style={{ color: "#666", marginBottom: 10 }}>
        📅 {evento.fecha} • 🕒 {evento.hora} • 📍 {evento.ubicacion}
      </Text>
      <Text style={{ marginBottom: 20 }}>{evento.descripcion}</Text>
      <Text style={{ marginBottom: 20, fontWeight: "bold" }}>
        Asistentes: {evento.asistentes.length}
      </Text>

      {isCreator ? (
        <View style={{ gap: 15 }}>
          <Text
            style={{ color: "blue", fontWeight: "bold", textAlign: "center" }}
          >
            👑 Eres el organizador
          </Text>
          <Button
            title="Editar Evento"
            onPress={() => router.push(`/(tabs)/create?id=${evento.id}`)}
          />
          <Button
            title="Eliminar Evento"
            color="#d9534f"
            onPress={handleDelete}
          />
        </View>
      ) : (
        <View style={{ gap: 15 }}>
          {isAttending ? (
            <Text
              style={{
                color: "green",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              ✓ Ya confirmaste tu asistencia
            </Text>
          ) : (
            <Button title="Confirmar Asistencia" onPress={handleRSVP} />
          )}

          {/* SECCIÓN DE COMENTARIOS (Solo asistentes) */}
          <View
            style={{
              marginTop: 30,
              borderTopWidth: 1,
              borderColor: "#ccc",
              paddingTop: 20,
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
            >
              Dejar un Comentario
            </Text>
            <Text>Calificación (1 - 5):</Text>
            <TextInput
              value={calificacion}
              onChangeText={setCalificacion}
              keyboardType="numeric"
              style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
            />
            <Text>Comentario:</Text>
            <TextInput
              value={textoComentario}
              onChangeText={setTextoComentario}
              style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
            />
            <Button
              title="Publicar"
              onPress={handlePublicarComentario}
              color="#555"
            />
          </View>
        </View>
      )}

      {/* LISTA DE COMENTARIOS */}
      <View style={{ marginTop: 20, marginBottom: 40 }}>
        <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
          Comentarios ({comentarios.length}):
        </Text>
        {comentarios.map((c) => (
          <View
            key={c.id}
            style={{
              padding: 10,
              backgroundColor: "#eee",
              marginBottom: 5,
              borderRadius: 5,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 5,
              }}
            >
              <Text style={{ fontWeight: "bold", color: "#333" }}>
                {c.usuarioNombre || "Usuario Anónimo"}
              </Text>
              <Text style={{ fontWeight: "bold", color: "#bb86fc" }}>
                {c.calificacion}/5
              </Text>
            </View>
            <Text>{c.texto}</Text>
          </View>
        ))}

        <View style={{ alignItems: "center", marginTop: 20 }}>
          <Button
            title="← Volver al Inicio"
            onPress={() => router.back()}
            color="#555"
          />
        </View>
      </View>
    </ScrollView>
  );
}
