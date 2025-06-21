const neo4j = require('neo4j-driver');
require('dotenv').config();
console.log(process.env.NEO4J_URI);

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

const verifyConnection = async () => {
  const session = driver.session();
  try {
    await session.run('RETURN 1');
    console.log('Conexión a Neo4j establecida correctamente');
  } catch (error) {
    console.error('Error al conectar con Neo4j:', error);
  } finally {
    await session.close();
  }
};

verifyConnection();

module.exports = driver;