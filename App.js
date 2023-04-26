import { Button, StyleSheet, Text, View, Image } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { useEffect, useState } from "react";
import axios from "axios";

const urlToBackEnd = "https://0da4-46-71-76-90.ngrok-free.app";
const urlToImageHosting = "25.51.165.235";

const App = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [hasAccess, setHasAccess] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState("");
  const [data, setData] = useState({});

  const askFOrCameraPermission = () => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasAccess(status === "granted");
      setShowCamera(status === "granted");
    })();
  };

  const handleBarCodeScanned = ({ type, data }) => {
    if (type === 32) {
      setText(data);
      setScanned(true);
      setShowCamera(false);
    }
  };
  useEffect(() => {
    if (text) {
      try {
        axios
          .get(`${urlToBackEnd}/barcode?code=${text}`)
          .then((res) => {
            setData(res.data.data)
          })
          .catch((e) => console.log(e));
      } catch (e) {
        console.log(e);
      }
    }
  }, [text]);
  return (
    <View style={styles.container}>
      {!!showCamera && (
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          style={{ height: 400, width: 400 }}
        />
      )}
      {hasAccess === false && (
        <>
          <Text>no access</Text>
          <Button title="Get Access" onPress={() => askFOrCameraPermission()} />
        </>
      )}
      {hasAccess === null && (
        <>
          <Text>Wait for</Text>
          <Button
            title="Scan now"
            onPress={() => {
              setText("");
              askFOrCameraPermission();
            }}
          />
        </>
      )}
      {scanned && (
        <Button
          title="scan again"
          onPress={() => {
            setText("");
            setData({});
            setScanned(false);
            setShowCamera(true);
          }}
        />
      )}
      {data.name && (
        <>
          <Image
            style={{ width: 100, height: 100 }}
            source={{ uri: `${urlToImageHosting}/uploads/${data.image}` }}
          />
          <Text>{data.name}</Text>
          <Text>{data.category}</Text>
          <Text>{data.bar_code}</Text>
          <Text>{data.count}</Text>
          <Text>{data.price}</Text>
          <Text>{data.description}</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default App;
