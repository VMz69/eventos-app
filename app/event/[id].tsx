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
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/context/AuthProvider";
import { db } from "../../src/services/firebaseConfig";
import { Comentario, Evento } from "../../src/types";
import { formatFecha, formatHora } from "../../src/utils/formatters";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [evento, setEvento] = useState<Evento | null>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [textoComentario, setTextoComentario] = useState("");
  const [calificacion, setCalificacion] = useState(5);
  const [publicando, setPublicando] = useState(false);
  const [confirmandoAsistencia, setConfirmandoAsistencia] = useState(false);

  useEffect(() => {
    if (!id) return;

    const unsubEvento = onSnapshot(
      doc(db, "eventos", id as string),
      (docSnap) => {
        if (docSnap.exists()) {
          setEvento({ id: docSnap.id, ...docSnap.data() } as Evento);
        } else {
          Alert.alert("Aviso", "El evento ha sido eliminado.");
          router.replace("/(tabs)");
        }
      },
    );

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
  const yaComento = comentarios.some((c) => c.usuarioId === user.uid);

  const handleDelete = () => {
    Alert.alert(
      "Eliminar evento",
      `¿Estás seguro de que deseas eliminar "${evento.titulo}"? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "eventos", evento.id!));
              // onSnapshot detectará el borrado y redirigirá automáticamente
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ],
    );
  };

  const handleRSVP = async () => {
    if (confirmandoAsistencia) return;
    setConfirmandoAsistencia(true);
    try {
      await updateDoc(doc(db, "eventos", evento.id!), {
        asistentes: arrayUnion(user.uid),
      });
      Alert.alert("¡Genial!", "Has confirmado tu asistencia.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setConfirmandoAsistencia(false);
    }
  };

  const handlePublicarComentario = async () => {
    if (!textoComentario.trim()) {
      return Alert.alert("Error", "Escribe un comentario antes de publicar.");
    }
    if (publicando) return;

    setPublicando(true);
    try {
      const userSnap = await getDoc(doc(db, "usuarios", user.uid));
      const nombreUsuario = userSnap.exists()
        ? userSnap.data().nombre
        : user.email;

      await addDoc(collection(db, "eventos", evento.id!, "comentarios"), {
        usuarioId: user.uid,
        usuarioNombre: nombreUsuario,
        texto: textoComentario.trim(),
        calificacion,
      });

      setTextoComentario("");
      setCalificacion(5);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setPublicando(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Encabezado del evento */}
      <Text style={styles.tituloEvento}>{evento.titulo}</Text>
      <Text style={styles.metaEvento}>
        📅 {formatFecha(evento.fecha)}
        {"  "}🕒 {formatHora(evento.hora)}
      </Text>
      <Text style={styles.metaEvento}>📍 {evento.ubicacion}</Text>
      <Text style={styles.descripcion}>{evento.descripcion}</Text>
      <Text style={styles.asistentes}>
        👥 {evento.asistentes.length}{" "}
        {evento.asistentes.length === 1 ? "asistente" : "asistentes"}
      </Text>

      {/* Acciones según el rol */}
      {isCreator ? (
        <View style={styles.seccion}>
          <Text style={styles.organizadorLabel}>👑 Eres el organizador</Text>
          <Button
            title="Editar Evento"
            onPress={() => router.push(`/(tabs)/create?id=${evento.id}`)}
          />
          <View style={{ marginTop: 10 }}>
            <Button
              title="Eliminar Evento"
              color="#d9534f"
              onPress={handleDelete}
            />
          </View>
        </View>
      ) : (
        <View style={styles.seccion}>
          {isAttending ? (
            <Text style={styles.asistenciaConfirmada}>
              ✓ Ya confirmaste tu asistencia
            </Text>
          ) : (
            <Button
              title={
                confirmandoAsistencia
                  ? "Confirmando..."
                  : "Confirmar Asistencia"
              }
              onPress={handleRSVP}
              disabled={confirmandoAsistencia}
            />
          )}

          {/* Formulario de comentario (solo si asiste y no ha comentado) */}
          <View style={styles.comentarioForm}>
            <Text style={styles.subtitulo}>Dejar un Comentario</Text>

            {yaComento ? (
              <Text style={styles.yaComento}>
                ✓ Ya dejaste tu comentario para este evento.
              </Text>
            ) : (
              <>
                {/* Selector visual de estrellas */}
                <Text style={styles.labelCalif}>Calificación:</Text>
                <View style={styles.estrellas}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setCalificacion(star)}
                    >
                      <Text
                        style={[
                          styles.estrella,
                          star <= calificacion
                            ? styles.estrellaActiva
                            : styles.estrellaInactiva,
                        ]}
                      >
                        ★
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.labelCalif}>Comentario:</Text>
                <TextInput
                  value={textoComentario}
                  onChangeText={setTextoComentario}
                  multiline
                  numberOfLines={3}
                  style={styles.comentarioInput}
                  placeholder="Comparte tu experiencia sobre el evento..."
                />
                <Button
                  title={publicando ? "Publicando..." : "Publicar"}
                  onPress={handlePublicarComentario}
                  color="#555"
                  disabled={publicando}
                />
              </>
            )}
          </View>
        </View>
      )}

      {/* Lista de comentarios */}
      <View style={styles.listaComentarios}>
        <Text style={styles.subtitulo}>Comentarios ({comentarios.length})</Text>
        {comentarios.length === 0 ? (
          <Text style={styles.sinComentarios}>
            Aún no hay comentarios. ¡Sé el primero!
          </Text>
        ) : (
          comentarios.map((c) => (
            <View key={c.id} style={styles.comentarioCard}>
              <View style={styles.comentarioHeader}>
                <Text style={styles.comentarioAutor}>
                  {c.usuarioNombre || "Usuario Anónimo"}
                </Text>
                <Text style={styles.comentarioCalif}>
                  {"★".repeat(c.calificacion)}
                  {"☆".repeat(5 - c.calificacion)}
                </Text>
              </View>
              <Text style={styles.comentarioTexto}>{c.texto}</Text>
            </View>
          ))
        )}

        <View style={styles.botonVolver}>
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

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  tituloEvento: { fontSize: 24, fontWeight: "bold", marginBottom: 6 },
  metaEvento: { color: "#555", fontSize: 14, marginBottom: 3 },
  descripcion: {
    marginTop: 12,
    marginBottom: 12,
    fontSize: 15,
    lineHeight: 22,
  },
  asistentes: { fontWeight: "bold", marginBottom: 16, fontSize: 15 },
  seccion: { gap: 10, marginBottom: 10 },
  organizadorLabel: {
    color: "blue",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  asistenciaConfirmada: {
    color: "green",
    fontWeight: "bold",
    textAlign: "center",
  },
  comentarioForm: {
    marginTop: 24,
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingTop: 20,
  },
  subtitulo: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  yaComento: { color: "green", fontStyle: "italic" },
  labelCalif: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  estrellas: {
    flexDirection: "row",
    marginBottom: 14,
  },
  estrella: { fontSize: 34, marginRight: 4 },
  estrellaActiva: { color: "#f5a623" },
  estrellaInactiva: { color: "#ccc" },
  comentarioInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    fontSize: 15,
    textAlignVertical: "top",
    minHeight: 70,
    backgroundColor: "#fff",
  },
  listaComentarios: { marginTop: 24, marginBottom: 40 },
  sinComentarios: { color: "#888", fontStyle: "italic", marginBottom: 10 },
  comentarioCard: {
    padding: 12,
    backgroundColor: "#f2f2f2",
    marginBottom: 8,
    borderRadius: 8,
  },
  comentarioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  comentarioAutor: { fontWeight: "bold", color: "#333" },
  comentarioCalif: { color: "#f5a623", fontSize: 15 },
  comentarioTexto: { color: "#444", lineHeight: 20 },
  botonVolver: { alignItems: "center", marginTop: 20 },
});
