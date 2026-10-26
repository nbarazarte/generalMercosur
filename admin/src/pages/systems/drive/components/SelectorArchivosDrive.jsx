import React, { useState } from "react";
import { DynamicIcon } from "../../../../components/IconCatalog";

export function SelectorArchivosDrive({
  archivosDrive,
  archivosSeleccionados,
  setArchivosSeleccionados,
  archivosNuevos,
  setArchivosNuevos,
  inputStyle,
  labelStyle,
  obtenerIconoPorTipo,
}) {
  const [isDragging, setIsDragging] = useState(false);

  // Función para formatear el tamaño del archivo en KB o MB
  const formatearTamanio = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const procesarArchivos = (filesList) => {
    const files = Array.from(filesList || []);
    if (!files.length) return;

    const nuevosFormateados = files.map((file) => ({
      id: `temp-${Date.now()}-${Math.random()}`,
      name: file.name,
      type: file.type,
      size: file.size, // Guardamos el tamaño en bytes
      rawFile: file,
      esNuevo: true,
    }));

    setArchivosNuevos((prev) => [...prev, ...nuevosFormateados]);
  };

  const handleFileChange = (e) => {
    procesarArchivos(e.target.files);
    e.target.value = "";
  };

  // Eventos de Drag and Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer && e.dataTransfer.files) {
      procesarArchivos(e.dataTransfer.files);
    }
  };

  const handleToggleExistente = (archivoId) => {
    setArchivosSeleccionados((prev) =>
      prev.includes(archivoId)
        ? prev.filter((id) => id !== archivoId)
        : [...prev, archivoId],
    );
  };

  const handleEliminarNuevo = (id) => {
    setArchivosNuevos((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Sección 1: Seleccionar archivos ya subidos en Drive */}
      {archivosDrive && archivosDrive.length > 0 && (
        <div className="field">
          <label style={labelStyle}>Archivos guardados en Drive</label>
          <div
            style={{
              maxHeight: "160px",
              overflowY: "auto",
              border: "1px solid var(--merco-border, #ccc)",
              borderRadius: "8px",
              padding: "10px",
              background: "var(--input, var(--merco-surface))",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            {archivosDrive.map((arch) => {
              const checked = archivosSeleccionados.includes(arch.id);
              return (
                <label
                  key={arch.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "13px",
                    cursor: "pointer",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    backgroundColor: checked
                      ? "rgba(249, 87, 0, 0.08)"
                      : "transparent",
                    border: checked
                      ? "1px solid var(--merco-accent, #f95700)"
                      : "1px solid transparent",
                    transition: "all 0.15s ease",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleExistente(arch.id)}
                    style={{
                      cursor: "pointer",
                      accentColor: "var(--merco-accent, #f95700)",
                    }}
                  />
                  <DynamicIcon
                    name={obtenerIconoPorTipo(arch.type, arch.name)}
                    style={{
                      color: "var(--merco-accent, #f95700)",
                      fontSize: "16px",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      flex: 1,
                    }}
                  >
                    {arch.name}
                  </span>
                  {arch.tamanioMb && (
                    <span
                      style={{ fontSize: "11px", opacity: 0.6, flexShrink: 0 }}
                    >
                      {arch.tamanioMb} MB
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Sección 2: Subir archivos con soporte Drag and Drop */}
      <div className="field">
        <label style={labelStyle}>
          Adjuntar o Cargar Archivos Nuevos{" "}
          <span style={{ color: "var(--merco-danger, #d1435b)" }}>*</span>
        </label>

        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragging ? "var(--merco-accent, #f95700)" : "var(--merco-border, #ccc)"}`,
            borderRadius: "8px",
            padding: "24px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: "pointer",
            background: isDragging
              ? "rgba(249, 87, 0, 0.06)"
              : "var(--merco-bg-subtle, rgba(0,0,0,0.01))",
            transition: "all 0.2s ease",
            textAlign: "center",
          }}
        >
          <DynamicIcon
            name={isDragging ? "FiDownloadCloud" : "FiUploadCloud"}
            style={{
              fontSize: "28px",
              color: "var(--merco-accent, #f95700)",
              transform: isDragging ? "scale(1.1)" : "scale(1)",
              transition: "transform 0.2s ease",
            }}
          />
          <span style={{ fontSize: "13px", fontWeight: "600" }}>
            {isDragging
              ? "Suelta los archivos aquí..."
              : "Arrastra tus archivos aquí o haz clic para explorar"}
          </span>
          <span style={{ fontSize: "11px", opacity: 0.6 }}>
            Soporta selección múltiple de documentos, imágenes y videos (Máx. 1
            GB)
          </span>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {/* Lista de vista previa de archivos seleccionados con su respectivo tamaño */}
      {archivosNuevos.length > 0 && (
        <div
          style={{
            padding: "12px",
            background: "var(--merco-bg-subtle, rgba(0,0,0,0.03))",
            borderRadius: "8px",
            border: "1px solid var(--merco-border, #ccc)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: "600",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Archivos locales a asociar:</span>
            <span
              style={{
                background: "var(--merco-accent, #f95700)",
                color: "#fff",
                padding: "1px 6px",
                borderRadius: "10px",
                fontSize: "11px",
              }}
            >
              {archivosNuevos.length}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              maxHeight: "150px",
              overflowY: "auto",
            }}
          >
            {archivosNuevos.map((file) => (
              <div
                key={file.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "1px solid var(--merco-border, #ccc)",
                  background: "var(--merco-surface, #ffffff)",
                  fontSize: "12px",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                }}
              >
                <DynamicIcon
                  name={obtenerIconoPorTipo(file.type, file.name)}
                  style={{
                    fontSize: "14px",
                    color: "var(--merco-accent, #f95700)",
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    maxWidth: "180px",
                  }}
                >
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontWeight: "500",
                    }}
                  >
                    {file.name}
                  </span>
                  <span style={{ fontSize: "10px", opacity: 0.6 }}>
                    {formatearTamanio(file.size)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleEliminarNuevo(file.id)}
                  style={{
                    color: "var(--merco-danger, #d1435b)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: "2px",
                    opacity: 0.8,
                    marginLeft: "4px",
                  }}
                  title="Eliminar archivo"
                >
                  <DynamicIcon name="FiX" style={{ fontSize: "14px" }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
