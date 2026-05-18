import { useLocalSearchParams, useRouter } from "expo-router";
import {
    arrayUnion,
    deleteDoc,
    doc,
    onSnapshot,
    updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Button, Text, View } from "react-native";
import { useAuth } from "../../src/context/AuthProvider";
import { db } from "../../src/services/firebaseConfig";
import { Evento } from "../../src/types";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [evento, setEvento] = useState<Evento | null>(null);

  useEffect(() => {
    if (!id) return;

    // Escucha en tiempo real para ver las asistencias actualizarse mágicamente
    const unsubscribe = onSnapshot(
      doc(db, "eventos", id as string),
      (docSnap) => {
        if (docSnap.exists()) {
          setEvento({ id: docSnap.id, ...docSnap.data() } as Evento);
        } else {
          // Si el creador lo elimina mientras lo ves, te expulsa
          Alert.alert("Aviso", "Este evento fue eliminado");
          router.back();
        }
      },
    );

    return () => unsubscribe();
  }, [id]);

  if (!evento || !user) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  // REGLA DE NEGOCIO: ¿Es el creador?
  const isCreator = user.uid === evento.creadorId;
  const isAttending = evento.asistentes.includes(user.uid);

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "eventos", evento.id!));
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleRSVP = async () => {
    try {
      // arrayUnion añade el ID sin duplicarlos
      await updateDoc(doc(db, "eventos", evento.id!), {
        asistentes: arrayUnion(user.uid),
      });
      Alert.alert("¡Genial!", "Has confirmado tu asistencia");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 5 }}>
        {evento.titulo}
      </Text>
      <Text style={{ color: "#666", marginBottom: 10 }}>
        📅 {evento.fecha} • 🕒 {evento.hora}
      </Text>
      <Text style={{ marginBottom: 10 }}>📍 {evento.ubicacion}</Text>
      <Text style={{ marginBottom: 20 }}>{evento.descripcion}</Text>

      <Text style={{ marginBottom: 20, fontWeight: "bold", fontSize: 16 }}>
        Asistentes confirmados: {evento.asistentes.length}
      </Text>

      {/* RENDERIZADO CONDICIONAL DE ROLES */}
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
        </View>
      )}
      {/* BOTÓN DE RETORNO (UX MEJORADA) */}
      <View style={{ alignItems: "center", marginTop: 20 }}>
        <Button
          title="← Volver al Inicio"
          onPress={() => router.back()}
          color="#555"
        />
      </View>
    </View>
  );
}
