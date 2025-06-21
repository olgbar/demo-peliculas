const driver = require("../config/neo4j");

class Funcion {
  static async crear({
    peliculaId,
    sucursalId,
    salaId,
    fecha,
    horarios,
    formato,
    idioma,
  }) {
    const session = driver.session();
    try {
      const result = await session.executeWrite(async (tx) => {
        // Verificar que la película existe
        const peliculaExists = await tx.run(
          "MATCH (p:Pelicula {id: $peliculaId}) RETURN p",
          { peliculaId }
        );

        if (peliculaExists.records.length === 0) {
          throw new Error("Película no encontrada");
        }

        // Verificar que el formato es válido para la película
        const formatoValido = await tx.run(
          `
                    MATCH (p:Pelicula {id: $peliculaId})-[:DISPONIBLE_EN]->(f:Formato {tipo: $formato})
                    RETURN f
                `,
          { peliculaId, formato }
        );

        if (formatoValido.records.length === 0) {
          throw new Error("Formato no disponible para esta película");
        }

        // Verificar que la sala existe
        const salaExists = await tx.run(
          "MATCH (s:Sala {id: $salaId}) RETURN s",
          { salaId: parseInt(salaId) }
        );

        if (salaExists.records.length === 0) {
          throw new Error("Sala no encontrada");
        }

        // Crear funciones para cada horario
        const funcionesCreadas = [];
        for (const hora of horarios) {
          // Verificar conflictos de horario en la misma sala
          const conflictoHorario = await tx.run(
            `
                        MATCH (f:Funcion {fecha: $fecha})-[:EN_SALA]->(s:Sala {id: $salaId})
                        WHERE f.hora = $hora
                        RETURN f
                    `,
            { fecha, hora, salaId: parseInt(salaId) }
          );

          if (conflictoHorario.records.length > 0) {
            throw new Error(
              `Ya existe una función en la sala ${salaId} el ${fecha} a las ${hora}`
            );
          }

          const funcionQuery = `
                        MATCH (p:Pelicula {id: $peliculaId})
                        MATCH (s:Sala {id: $salaId})
                        CREATE (f:Funcion {
                            id: apoc.create.uuid(),
                            fecha: $fecha,
                            hora: $hora,
                            idioma: $idioma,
                            formato: $formato,
                            sucursal_id: $sucursalId,
                            createdAt: datetime()
                        })
                        CREATE (p)-[:EN_FUNCION]->(f)
                        CREATE (f)-[:EN_SALA]->(s)
                        RETURN f
                    `;

          const funcionResult = await tx.run(funcionQuery, {
            peliculaId,
            salaId: parseInt(salaId),
            fecha,
            hora,
            idioma,
            formato,
            sucursalId: parseInt(sucursalId),
          });

          funcionesCreadas.push(funcionResult.records[0].get("f").properties);
        }

        return funcionesCreadas;
      });

      return result;
    } catch (error) {
      console.error("Error al crear función:", error);
      throw error;
    } finally {
      await session.close();
    }
  }

  static async listarPorPelicula(peliculaId) {
    const session = driver.session();
    try {
      const result = await session.run(
        `
                MATCH (p:Pelicula {id: $peliculaId})-[:EN_FUNCION]->(f:Funcion)-[:EN_SALA]->(s:Sala)
                RETURN f, s.nombre AS sala, s.id AS salaId
                ORDER BY f.fecha, f.hora
            `,
        { peliculaId }
      );

      return result.records.map((record) => ({
        ...record.get("f").properties,
        sala: record.get("sala"),
        salaId: record.get("salaId"),
      }));
    } catch (error) {
      console.error("Error al listar funciones por película:", error);
      throw error;
    } finally {
      await session.close();
    }
  }

  static async listarPorSucursal(sucursalId) {
    const session = driver.session();
    try {
      const result = await session.run(
        `
                MATCH (f:Funcion {sucursal_id: $sucursalId})-[:EN_SALA]->(s:Sala)
                MATCH (p:Pelicula)-[:EN_FUNCION]->(f)
                RETURN f, p.titulo AS pelicula, p.id AS peliculaId, s.nombre AS sala, s.id AS salaId
                ORDER BY f.fecha, f.hora
            `,
        { sucursalId: parseInt(sucursalId) }
      );

      return result.records.map((record) => ({
        ...record.get("f").properties,
        pelicula: record.get("pelicula"),
        peliculaId: record.get("peliculaId"),
        sala: record.get("sala"),
        salaId: record.get("salaId"),
      }));
    } catch (error) {
      console.error("Error al listar funciones por sucursal:", error);
      throw error;
    } finally {
      await session.close();
    }
  }

  static async obtenerSalasDisponibles(sucursalId, fecha, hora) {
    const session = driver.session();
    try {
      const result = await session.run(
        `
                // Encontrar todas las salas de la sucursal
                MATCH (s:Sala)
                WHERE NOT EXISTS {
                    MATCH (f:Funcion {sucursal_id: $sucursalId, fecha: $fecha, hora: $hora})-[:EN_SALA]->(s)
                }
                RETURN s
                ORDER BY s.nombre
            `,
        {
          sucursalId: parseInt(sucursalId),
          fecha,
          hora,
        }
      );

      return result.records.map((record) => record.get("s").properties);
    } catch (error) {
      console.error("Error al obtener salas disponibles:", error);
      throw error;
    } finally {
      await session.close();
    }
  }

  static async obtenerPorId(funcionId) {
    const session = driver.session();
    try {
      const result = await session.run(
        `
                MATCH (p:Pelicula)-[:EN_FUNCION]->(f:Funcion {id: $funcionId})-[:EN_SALA]->(s:Sala)
                RETURN f, p.titulo AS pelicula, p.id AS peliculaId, s.nombre AS sala, s.id AS salaId
            `,
        { funcionId }
      );

      if (result.records.length === 0) return null;

      const record = result.records[0];
      return {
        ...record.get("f").properties,
        pelicula: record.get("pelicula"),
        peliculaId: record.get("peliculaId"),
        sala: record.get("sala"),
        salaId: record.get("salaId"),
      };
    } catch (error) {
      console.error("Error al obtener función por ID:", error);
      throw error;
    } finally {
      await session.close();
    }
  }

  static async obtenerSalasPorSucursal(sucursalId) {
    const session = driver.session();
    try {
      const result = await session.run(`
            MATCH (s:Sala)
            RETURN s
            ORDER BY s.nombre
        `);

      return result.records.map((record) => record.get("s").properties);
    } catch (error) {
      console.error("Error al obtener salas por sucursal:", error);
      throw error;
    } finally {
      await session.close();
    }
  }
}

module.exports = Funcion;
