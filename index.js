import snmp from "net-snmp";
import xlsx from "xlsx";
import fs from "fs";

const options = {
  maxMsgSize: 65535, // Aumenta el tamaño máximo del mensaje PDU
};

const snmpGetAsync = (session, oid) => {
  return new Promise((resolve, reject) => {
    session.get(oid, (error, varbinds) => {
      if (error) {
        reject(error); // Rechaza la promesa si hay un error
      } else {
        resolve(varbinds); // Resuelve la promesa con los varbinds
      }
    });
  });
};

const dateTime = () => {
  const fechaActual = new Date();

  // Obtener componentes de la fecha
  const año = fechaActual.getFullYear();
  const mes = String(fechaActual.getMonth() + 1).padStart(2, "0"); // Los meses empiezan en 0
  const dia = String(fechaActual.getDate()).padStart(2, "0");

  // Obtener componentes de la hora
  const horas = String(fechaActual.getHours()).padStart(2, "0");
  const minutos = String(fechaActual.getMinutes()).padStart(2, "0");
  const segundos = String(fechaActual.getSeconds()).padStart(2, "0");

  // Formato de fecha y hora
  return `${año}-${mes}-${dia}_${horas}-${minutos}-${segundos}`;
};

const get_snmpvalues = async (ip) => {
  const session = snmp.createSession(ip, "public", options);
  const snmp_map = {
    "1.3.6.1.2.1.25.3.2.1.3.1": "modelo",
    "1.3.6.1.2.1.43.5.1.1.17.1": "serie",
    "1.3.6.1.2.1.43.5.1.1.16.1": "hostname",
    "1.3.6.1.2.1.1.5.0": "name",
    "1.3.6.1.2.1.43.10.2.1.4.1.1": "ciclos_motor",
    "1.3.6.1.2.1.43.16.5.1.2.1.1": "mensaje_1",
    "1.3.6.1.2.1.43.16.5.1.2.1.2": "mensaje_2",
    "1.3.6.1.2.1.43.16.5.1.2.1.3": "mensaje_3",
    "1.3.6.1.2.1.43.16.5.1.2.1.4": "mensaje_4",
    "1.3.6.1.2.1.43.16.5.1.2.1.5": "mensaje_5",
    "1.3.6.1.2.1.43.16.5.1.2.1.6": "mensaje_6",
    "1.3.6.1.2.1.43.16.5.1.2.1.7": "mensaje_7",
    "1.3.6.1.2.1.43.11.1.1.6.1.1": "toner_descripcion",
    "1.3.6.1.2.1.43.11.1.1.9.1.1": "toner_porcentaje",
    "1.3.6.1.4.1.11.2.3.9.4.2.1.4.1.10.1.1.8.1.0": "toner_fecha_cambio",
    "1.3.6.1.2.1.43.11.1.1.6.1.6": "recolector_toner_descripcion",
    "1.3.6.1.2.1.43.11.1.1.9.1.6": "recolector_toner_estado",
    "1.3.6.1.2.1.43.11.1.1.6.1.2": "drum_descripcion",
    "1.3.6.1.2.1.43.11.1.1.9.1.2": "drum_porcentaje",
    "1.3.6.1.2.1.43.11.1.1.6.1.3": "revelador_descripcion",
    "1.3.6.1.2.1.43.11.1.1.9.1.3": "revelador_porcentaje",
    "1.3.6.1.2.1.43.11.1.1.6.1.4": "rodillo_transferencia_descripcion",
    "1.3.6.1.2.1.43.11.1.1.9.1.4": "rodillo_transferencia_porcentaje",
    "1.3.6.1.2.1.43.11.1.1.6.1.5": "fusor_descripcion",
    "1.3.6.1.2.1.43.11.1.1.9.1.5": "fusor_porcentaje",
    /*"1.3.6.1.2.1.43.11.1.1.6.1.7": "rodillo_recojida_adf_descripcion", // Rodillo de recogida del AAD HP Z7Y64A
    "1.3.6.1.2.1.43.11.1.1.9.1.7": "rodillo_recojida_adf_porcentaje",
    "1.3.6.1.2.1.43.11.1.1.6.1.8": "rodillo_separacion_adf_descripcion",
    "1.3.6.1.2.1.43.11.1.1.9.1.8": "rodillo_separacion_adf_porcentaje",
    "1.3.6.1.2.1.43.11.1.1.6.1.12": "rodillo_bandeja1_descripcion", // = Kit de rodillos para la bandeja 1 HP Z7Y88A
    "1.3.6.1.2.1.43.11.1.1.9.1.12": "rodillo_bandeja1_porcentaje",
    "1.3.6.1.2.1.43.11.1.1.6.1.13": "rodillo_bandeja2_descripcion", // = Kit rodillo bandeja 2 HP Z7Y83A
    "1.3.6.1.2.1.43.11.1.1.9.1.13": "rodillo_bandeja2_porcentaje", // = 60
    "1.3.6.1.2.1.43.11.1.1.6.1.14": "rodillo_bandeja3_descripcion", // = Kit de rodillos para la bandeja 3 HP Z7Y83A
    "1.3.6.1.2.1.43.11.1.1.9.1.14": "rodillo_bandeja3_porcentaje", // = 88
    "1.3.6.1.2.1.43.11.1.1.6.1.15": "rodillo_bandeja4_descripcion", //  = Kit de rodillos para la bandeja 4 HP Z7Y83A
    "1.3.6.1.2.1.43.11.1.1.9.1.15": "rodillo_bandeja4_porcentaje", //  = 89
    "1.3.6.1.2.1.43.11.1.1.6.1.16": "rodillo_bandeja5_descripcion", // = Kit de rodillos para la bandeja 5 HP Z7Y83A
    "1.3.6.1.2.1.43.11.1.1.9.1.16": "rodillo_bandeja5_porcentaje", // = 65*/
  };

  const oid = [
    "1.3.6.1.2.1.25.3.2.1.3.1",
    "1.3.6.1.2.1.43.5.1.1.17.1",
    "1.3.6.1.2.1.43.5.1.1.16.1",
    //"1.3.6.1.2.1.1.5.0",
    "1.3.6.1.2.1.43.10.2.1.4.1.1", //ciclos de motor
    "1.3.6.1.2.1.43.16.5.1.2.1.1", //Mensaje en pantalla puede ir del 1 al 7 u 8
    "1.3.6.1.2.1.43.16.5.1.2.1.2",
    "1.3.6.1.2.1.43.16.5.1.2.1.3",
    "1.3.6.1.2.1.43.16.5.1.2.1.4",
    "1.3.6.1.2.1.43.16.5.1.2.1.5",
    "1.3.6.1.2.1.43.16.5.1.2.1.6",
    "1.3.6.1.2.1.43.16.5.1.2.1.7",

    "1.3.6.1.2.1.43.11.1.1.6.1.1",
    "1.3.6.1.2.1.43.11.1.1.9.1.1",
    "1.3.6.1.4.1.11.2.3.9.4.2.1.4.1.10.1.1.8.1.0",

    "1.3.6.1.2.1.43.11.1.1.6.1.2",
    "1.3.6.1.2.1.43.11.1.1.9.1.2",

    "1.3.6.1.2.1.43.11.1.1.6.1.3",
    "1.3.6.1.2.1.43.11.1.1.9.1.3",

    "1.3.6.1.2.1.43.11.1.1.6.1.4",
    "1.3.6.1.2.1.43.11.1.1.9.1.4",

    "1.3.6.1.2.1.43.11.1.1.6.1.5",
    "1.3.6.1.2.1.43.11.1.1.9.1.5",

    "1.3.6.1.2.1.43.11.1.1.6.1.6",
    "1.3.6.1.2.1.43.11.1.1.9.1.6",
/*
    "1.3.6.1.2.1.43.11.1.1.6.1.7",
    "1.3.6.1.2.1.43.11.1.1.9.1.7",

    "1.3.6.1.2.1.43.11.1.1.6.1.8",
    "1.3.6.1.2.1.43.11.1.1.9.1.8",

    "1.3.6.1.2.1.43.11.1.1.6.1.12",
    "1.3.6.1.2.1.43.11.1.1.9.1.12",

    "1.3.6.1.2.1.43.11.1.1.6.1.13",
    "1.3.6.1.2.1.43.11.1.1.9.1.13",

    "1.3.6.1.2.1.43.11.1.1.6.1.14",
    "1.3.6.1.2.1.43.11.1.1.9.1.14",

    "1.3.6.1.2.1.43.11.1.1.6.1.15",
    "1.3.6.1.2.1.43.11.1.1.9.1.15",

    "1.3.6.1.2.1.43.11.1.1.6.1.16",
    "1.3.6.1.2.1.43.11.1.1.9.1.16",*/
  ];

  let result = {};

  try {
    result["ip"] = ip;
    const varbinds = await snmpGetAsync(session, oid);
    varbinds.forEach((varbind) => {
      // Si el OID no es nulo, imprime el valor
      if (snmp.isVarbindError(varbind)) {
        throw snmp.varbindError(varbind);
      } else {
        const key = snmp_map[varbind.oid] || "default_key";
        const value =
          varbind.value == undefined || varbind.value == null
            ? "Valor no disponible"
            : `${varbind.value}`;
        result[key] = value;
      }
    });
    let dateChangeToner = result.toner_fecha_cambio;
    dateChangeToner = dateChangeToner.replace(/\D/g, "");
    result.toner_fecha_cambio = `${dateChangeToner.slice(
      0,
      4
    )}-${dateChangeToner.slice(4, 6)}-${dateChangeToner.slice(6)}`;
    return result;
  } catch (error) {
    console.log(`Error: ${ip}:::${error}`);
    result["ip"] = ip;
    result["modelo"] = null;
    result["serie"] = null;
    result["hostname"] = null;
    result["ciclos_motor"] = null;
    result["mensaje_1"] = null;
    result["mensaje_2"] = null;
    result["mensaje_3"] = null;
    result["mensaje_4"] = null;
    result["mensaje_5"] = null;
    result["mensaje_6"] = null;
    result["mensaje_7"] = null;
    result["toner_descripcion"] = null;
    result["toner_porcentaje"] = null;
    result["toner_fecha_cambio"] = null;
    result["drum_descripcion"] = null;
    result["drum_porcentaje"] = null;
    result["revelador_descripcion"] = null;
    result["revelador_porcentaje"] = null;
    result["rodillo_transferencia_descripcion"] = null;
    result["rodillo_transferencia_porcentaje"] = null;
    result["fusor_descripcion"] = null;
    result["fusor_porcentaje"] = null;
    result["recolector_toner_descripcion"] = null;
    result["recolector_toner_estado"] = null;
    result["rodillo_recojida_adf_descripcion"] = null;
    result["rodillo_recojida_adf_porcentaje"] = null;
    result["rodillo_separacion_adf_descripcion"] = null;
    result["rodillo_separacion_adf_porcentaje"] = null;
    result["rodillo_bandeja1_descripcion"] = null;
    result["rodillo_bandeja1_porcentaje"] = null;
    result["rodillo_bandeja2_descripcion"] = null;
    result["rodillo_bandeja2_porcentaje"] = null;
    result["rodillo_bandeja3_descripcion"] = null;
    result["rodillo_bandeja3_porcentaje"] = null;
    result["rodillo_bandeja4_descripcion"] = null;
    result["rodillo_bandeja4_porcentaje"] = null;
    result["rodillo_bandeja5_descripcion"] = null;
    result["rodillo_bandeja5_porcentaje"] = null;

    return result;
  } finally {
    // Cierra la sesión SNMP
    session.close();
  }
};

/*const ips = [
  "10.39.76.27",
  "10.39.80.123",
  "10.39.143.125",
  "10.39.36.123",
  "10.39.12.120",
  "10.39.28.123",
  "10.39.86.119",
  "10.39.7.27",
  "10.39.70.120",
  "10.39.2.27",
  "10.39.6.120",
  "10.39.122.120",
  "10.39.111.120",
  "10.39.21.120",
  "10.39.66.120",
  "10.39.75.27",
  "10.39.45.27",
  "10.39.39.120",
  "10.39.115.120",
  "10.39.61.120",
  "10.39.38.27",
  "10.39.14.120",
  "10.39.78.27",
  "10.39.62.120",
  "10.39.59.120",
  "10.39.83.27",
  "10.39.71.120",
  "10.39.101.27",
  "10.39.102.27",
  "10.39.124.120",
  "10.38.35.27",
  "10.39.109.120",
  "10.39.77.120",
  "10.39.5.120",
  "10.39.68.120",
  "10.39.18.120",
  "10.39.120.120",
  "10.39.10.120",
  "10.39.67.120",
  "10.39.144.125",
  "10.39.98.27",
  "10.39.37.120",
  "10.39.27.120",
  "10.39.119.120",
  "10.39.23.120",
  "10.39.105.27",
  "10.39.112.120",
  "10.39.56.120",
  "10.39.84.27",
  "10.39.110.120",
  "10.39.85.120",
  "10.39.140.112",
  "10.39.139.121",
  "10.39.142.121",
  "10.39.146.120",
  "10.39.89.120",
  "10.39.1.27",
  "10.39.72.120",
  "10.39.116.120",
  "10.39.121.120",
  "10.39.69.120",
  "10.39.54.120",
  "10.38.81.43",
  "10.39.114.120",
  "10.39.130.121",
  "10.39.53.120",
  "10.39.11.120",
  "10.39.26.120",
  "10.39.55.101",
  "10.39.44.120",
  "10.39.79.120",
  "10.39.16.120",
  "10.39.30.120",
  "10.39.90.27",
  "10.39.52.120",
  "10.39.60.120",
  "10.39.22.120",
  "10.39.73.120",
  "10.39.104.27",
  "10.39.8.120",
  "10.39.57.120",
  "10.39.17.120",
  "10.39.64.120",
  "10.39.20.120",
  "10.39.135.120",
  "10.39.15.120",
  "10.39.49.27",
  "10.39.123.120",
  "10.39.46.27",
  "10.39.29.120",
  "10.39.58.123",
  "10.39.41.27",
  "10.39.50.123",
  "10.39.65.120",
  "10.39.48.120",
  "10.39.118.120",
  "10.39.108.120",
  "10.39.47.120",
  "10.39.63.120",
  "10.39.95.27",
  //"10.39.97.30",//Antigua Huanuco
  "10.39.97.120",//nueva Huanuco
  "10.39.103.27",
  "10.39.43.120",
  "10.39.88.27",
];*/

const ips = ["10.39.134.123", "10.39.131.100", "10.39.117.120", "10.39.107.123", "10.39.141.139", "10.39.42.120", 
  "10.39.42.113", "10.159.21.119", "10.159.22.126", "10.159.20.125", "10.159.21.125", "10.53.111.61", "10.159.16.119", 
  "10.159.11.124", "10.53.121.66", "10.53.132.120", "10.53.1.51", "10.53.5.68", "10.53.113.65", "10.53.132.119", 
  "10.159.4.115", "10.53.111.65", "10.159.19.125", "10.53.1.52", "10.53.113.66", "10.53.123.65", "10.53.103.65", 
  "10.53.129.66", "10.53.7.66", "10.53.119.66", "10.53.121.65", "10.53.117.66", "10.53.129.65", "10.53.115.65", 
  "10.53.7.65", "10.53.125.66", "10.159.19.105", "10.53.125.63", "10.159.18.120", "10.53.117.65", "10.53.117.67", 
  "10.53.5.65", "10.53.103.66", "10.159.7.105", "10.159.4.120", "10.53.125.65", "10.159.16.120", "10.159.18.125", 
  "10.53.127.66", "10.159.19.104", "10.158.17.60", "10.53.119.65", "10.53.123.66", "10.53.127.65", "10.53.111.66"]

const all = ips.map((value) => {
  return get_snmpvalues(value);
});

Promise.all(all)
  .then((resultados) => {
    console.log("Todas las promesas se resolvieron: ", resultados);
    fs.writeFileSync("./resultados.json", JSON.stringify(resultados), null, 2); // Guarda los resultados en formato JSON

    const wb = xlsx.utils.book_new();
    // Convertir el objeto JSON en una hoja de trabajo
    const ws = xlsx.utils.json_to_sheet(resultados);

    // Añadir la hoja de trabajo al libro de trabajo
    xlsx.utils.book_append_sheet(wb, ws, "Datos");

    // Generar el archivo Excel
    let d = dateTime();
    const filePath = `./reporte-${d}.xlsx`;
    xlsx.writeFile(wb, filePath);

    console.log(`Archivo Excel generado: ${filePath}`);
  })
  .catch((error) => {
    console.error("Una de las promesas falló: ", error);
  });
