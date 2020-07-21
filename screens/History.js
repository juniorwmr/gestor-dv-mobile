import React, { useState, useEffect } from "react";
import LottieView from  "lottie-react-native";
import {
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  View,
  Modal,
  Text,
  TextInput,
  Linking,
  FlatList,
  Dimensions,
  ToastAndroid,
  Button,
} from "react-native";
import Moment from "moment";
import api from "../services/api";
import { Feather as Icon, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function History() {
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [date, setDate] = useState();

  const loadSales = async () => {
    setLoading(true);
    const date_modified = Moment(date).format("YYYY-MM-DD");
    const { data } = await api.post("/sales", {
      date: date_modified,
    });
    setSales(data.sales);
    setLoading(false);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    hideDatePicker();
    setDate(date);
  };

  async function onRefresh() {
    setRefresh(true);
    await loadSales();
    setRefresh(false);
  }

  useEffect(() => {
    loadSales();
  }, [date]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={showDatePicker} style={styles.dateContainer}>
        <FontAwesome
          style={{ marginRight: 10 }}
          name="arrow-left"
          color={"white"}
          size={20}
        />
        <Text style={{ color: "white" }}>
          {Moment(date).format("DD/MM/YYYY")}
        </Text>
        <FontAwesome
          style={{ marginLeft: 10 }}
          name="arrow-right"
          color={"white"}
          size={20}
        />
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          date={new Date()}
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />
      </TouchableOpacity>
      {loading ? (
        <View style={{flex: 1, width: 100, height: 100, justifyContent: 'center', alignItems: 'center'}}>
        <LottieView
        source={require("../assets/animations/loading.json")}
        loop
        autoPlay
        /> 
        </View>
      ) : (
        <FlatList
          data={sales}
          onRefresh={onRefresh}
          refreshing={refresh}
          enableEmptySections={true}
          renderItem={({ item, index }) => {
            return (
              <>
                {item.type == 1 ? (
                  <View style={styles.salesNegative}>
                    <FontAwesome
                      style={styles.salesIcon}
                      name="minus-square"
                      size={25}
                      color="#ff6e6e"
                    />
                    <Text style={styles.salesName}>{item.client_id.name}</Text>
                    <Text style={styles.salesDescription}>
                      {item.description}
                    </Text>
                    <Text style={styles.salesDate}>
                      {Moment(item.created_at).format("DD/MM/YYYY")}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.salesPositive}>
                    <FontAwesome
                      style={styles.salesIcon}
                      name="plus-square"
                      size={25}
                      color="#69b347"
                    />
                    <Text style={styles.salesName}>{item.client_id.name}</Text>
                    <Text style={styles.salesDescription}>
                      {item.description}
                    </Text>
                    <Text style={styles.salesDate}>
                      {Moment(item.created_at).format("DD/MM/YYYY")}
                    </Text>
                  </View>
                )}
              </>
            );
          }}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
}

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    paddingTop: 50,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  dateContainer: {
    display: "flex",
    flexDirection: "row",
    margin: 20,
    padding: 15,
    backgroundColor: "#4079ff",
    shadowColor: "#000",
    borderRadius: 40,
    elevation: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    top: -15,
    right: -8,
  },
  salesNegative: {
    flex: 1,
    width: width,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ffcfcf",
    borderRadius: 20,
    marginBottom: 10,
    padding: 20,
  },
  salesPositive: {
    flex: 1,
    width: width,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#d5ffc4",
    borderRadius: 20,
    marginBottom: 10,
    padding: 20,
  },
  salesIcon: {
    position: "absolute",
    left: 15,
    top: 18,
  },
  salesName: {
    left: 22,
    color: "#545454",
    fontSize: 15,
    fontWeight: "bold",
  },
  salesDescription: {
    fontSize: 11,
    left: 10,
    fontStyle: "italic",
    top: 5,
  },
  salesDate: {
    color: "#545454",
    fontSize: 15,
    top: 3,
  },
});
