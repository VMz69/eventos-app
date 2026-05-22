import {
  collection,
  collectionGroup,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useAuth } from "../../src/context/AuthProvider";
import { db } from "../../src/services/firebaseConfig";
import { Comentario, Evento } from "../../src/types";

type ComentarioConEvento = Comentario & { eventoId: string | undefined };

export default function StatsScreen() {
  const { user } = useAuth();

  const [eventosAsistidos, setEventosAsistidos] = useState<Evento[]>([]);
  const [todosLosComentarios, setTodosLosComentarios] = useState<
    ComentarioConEvento[]
  >([]);
  const [promedio, setPromedio] = useState<number>(0);
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [loadingComentarios, setLoadingComentarios] = useState(true);

  // Escucha los eventos asistidos
  useEffect(() => {
    if (!user) return;

    const qEventos = query(
      collection(db, "eventos"),
      where("asistentes", "array-contains", user.uid),
    );
    return onSnapshot(qEventos, (snap) => {
      setEventosAsistidos(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Evento),
      );
      setLoadingEventos(false);
    });
  }, [user]);

  // Escucha todos los comentarios del usuario (en cualquier evento)
  useEffect(() => {
    if (!user) return;

    const qComentarios = query(
      collectionGroup(db, "comentarios"),
      where("usuarioId", "==", user.uid),
    );
    return onSnapshot(qComentarios, (snap) => {
      setTodosLosComentarios(
        snap.docs.map((doc) => ({
          ...(doc.data() as Comentario),
          eventoId: doc.ref.parent.parent?.id,
        })),
      );
      setLoadingComentarios(false);
    });
  }, [user]);

  // Recalcula el promedio cruzando comentarios con eventos asistidos
  useEffect(() => {
    const eventosIds = new Set(eventosAsistidos.map((e) => e.id));
    const relevantes = todosLosComentarios.filter((c) =>
      eventosIds.has(c.eventoId),
    );

    if (relevantes.length === 0) {
      setPromedio(0);
    } else {
      const total = relevantes.reduce((sum, c) => sum + c.calificacion, 0);
      setPromedio(total / relevantes.length);
    }
  }, [eventosAsistidos, todosLosComentarios]);

  // ⭐ FUNCIÓN PARA MOSTRAR ESTRELLAS
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;

    let stars = "";

    for (let i = 0; i < fullStars; i++) {
      stars += "⭐";
    }

    if (halfStar) {
      stars += "✨"; // media estrella opcional
    }

    return stars;
  };

  if (loadingEventos || loadingComentarios)
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Mi Actividad
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 30,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#e0e0e0",
            padding: 15,
            borderRadius: 8,
            marginRight: 5,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#bb86fc" }}>
            {eventosAsistidos.length}
          </Text>
          <Text style={{ fontSize: 12, textAlign: "center" }}>
            Eventos Asistidos
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: "#e0e0e0",
            padding: 15,
            borderRadius: 8,
            marginLeft: 5,
            alignItems: "center",
          }}
        >
          {/* PROMEDIO NUMÉRICO */}
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#bb86fc" }}>
            {promedio.toFixed(1)}
          </Text>

          {/* ESTRELLITAS */}
          <Text style={{ fontSize: 18, marginTop: 5 }}>
            {renderStars(promedio)}
          </Text>

          <Text style={{ fontSize: 12, textAlign: "center", marginTop: 5 }}>
            Calificación que has dado
          </Text>
        </View>
      </View>

      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        Historial de Asistencia
      </Text>
      {eventosAsistidos.length === 0 ? (
        <Text style={{ color: "#666" }}>
          Aún no has asistido a ningún evento.
        </Text>
      ) : (
        eventosAsistidos.map((ev) => (
          <View
            key={ev.id}
            style={{
              padding: 15,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              marginBottom: 10,
              opacity: 0.7,
            }}
          >
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
              {ev.titulo}
            </Text>
            <Text style={{ color: "#666" }}>
              {ev.fecha} • {ev.ubicacion}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
