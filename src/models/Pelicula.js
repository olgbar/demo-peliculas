const driver = require('../config/neo4j');

class Pelicula {
  static async crear({ titulo, anio, duracion, calificacion, sinopsis, director, reparto, generos, formatos, imagen_url }) {
    const session = driver.session();
    try {
      const result = await session.executeWrite(async tx => {
        // Crear película
        const peliculaQuery = `
          CREATE (p:Pelicula {
            id: apoc.create.uuid(),
            titulo: $titulo,
            anio: $anio,
            duracion: $duracion,
            calificacion: $calificacion,
            sinopsis: $sinopsis,
            director: $director,
            reparto: $reparto,
            createdAt: datetime(),
            imagen_url: $imagen_url
          })
          RETURN p
        `;
        
        const peliculaResult = await tx.run(peliculaQuery, {
          titulo,
          anio: parseInt(anio),
          duracion: parseInt(duracion),
          calificacion: parseInt(calificacion),
          sinopsis,
          director,
          reparto: reparto.split(',').map(item => item.trim())
        });

        const peliculaId = peliculaResult.records[0].get('p').properties.id;

        // Añadir géneros
        for (const genero of generos.split(',')) {
          const generoQuery = `
            MATCH (p:Pelicula {id: $peliculaId})
            MERGE (g:Genero {nombre: $genero})
            MERGE (p)-[:TIENE_GENERO]->(g)
          `;
          await tx.run(generoQuery, { peliculaId, genero: genero.trim() });
        }

        // Añadir formatos
        for (const formato of formatos.split(',')) {
          const formatoQuery = `
            MATCH (p:Pelicula {id: $peliculaId})
            MERGE (f:Formato {tipo: $formato})
            MERGE (p)-[:DISPONIBLE_EN]->(f)
          `;
          await tx.run(formatoQuery, { peliculaId, formato: formato.trim() });
        }

        return peliculaResult;
      });

      return result.records[0].get('p').properties;
    } catch (error) {
      console.error('Error al crear película:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  static async listar() {
    const session = driver.session();
    try {
      const result = await session.run(`
        MATCH (p:Pelicula)
        OPTIONAL MATCH (p)-[:TIENE_GENERO]->(g:Genero)
        WITH p, COLLECT(g.nombre) AS generos
        RETURN p, generos
        ORDER BY p.createdAt DESC
      `);

      return result.records.map(record => ({
        ...record.get('p').properties,
        generos: record.get('generos')
      }));
    } catch (error) {
      console.error('Error al listar películas:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  static async buscarPorId(id) {
    const session = driver.session();
    try {
      const result = await session.run(`
        MATCH (p:Pelicula {id: $id})
        OPTIONAL MATCH (p)-[:TIENE_GENERO]->(g:Genero)
        OPTIONAL MATCH (p)-[:DISPONIBLE_EN]->(f:Formato)
        WITH p, COLLECT(DISTINCT g.nombre) AS generos, COLLECT(DISTINCT f.tipo) AS formatos
        RETURN p, generos, formatos
      `, { id });

      if (result.records.length === 0) return null;

      const record = result.records[0];
      return {
        ...record.get('p').properties,
        generos: record.get('generos'),
        formatos: record.get('formatos')
      };
    } catch (error) {
      console.error('Error al buscar película por ID:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  static async obtenerGeneros() {
    const session = driver.session();
    try {
      const result = await session.run(`
        MATCH (g:Genero)
        RETURN g.nombre AS genero
        ORDER BY g.nombre
      `);

      return result.records.map(record => record.get('genero'));
    } catch (error) {
      console.error('Error al obtener géneros:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  static async obtenerFormatos() {
    const session = driver.session();
    try {
      const result = await session.run(`
        MATCH (f:Formato)
        RETURN f.tipo AS formato
        ORDER BY f.tipo
      `);

      return result.records.map(record => record.get('formato'));
    } catch (error) {
      console.error('Error al obtener formatos:', error);
      throw error;
    } finally {
      await session.close();
    }
  }
}

module.exports = Pelicula;