import React, { useState, useEffect } from "react";
import ActionButton from "react-native-action-button";
import {
  StyleSheet,
  SafeAreaView,
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
} from "react-native";
import { Feather as Icon, FontAwesome } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import Moment from "moment";
import Dialog, {
  DialogFooter,
  DialogButton,
  DialogContent,
} from "react-native-popup-dialog";
import api from "../services/api";

export default function Profile() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [type, setType] = useState(null);
  const route = useRoute();
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [visible, setVisible] = useState(false);
  const [sale, setSale] = useState(null);
  const [sales, setSales] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [description, setDescription] = useState("");
  const [value, setValue] = useState(0);

  function notifyMessage(msg) {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      AlertIOS.alert(msg);
    }
  }

  const addSale = async () => {
    setLoading(true);
    const response = await api.post(`/sales/${route.params.id}`, {
      description,
      value,
      type,
    });
    setLoading(false);
    setModalVisible(false);
    if (response.status == 200) {
      notifyMessage("Adicionado com sucesso!");
      onRefresh();
    } else {
      notifyMessage("Houve um erro ao cadastrar, tente novamente!");
    }
  };

  async function onRefresh() {
    setRefresh(true);
    await loadSales();
    setRefresh(false);
  }

  const CalculateSales = (sale) => {
    let negatives = [];
    let positives = [];
    sale.map((item) => {
      if (item.type == 1) {
        negatives.push(item.value);
      } else {
        positives.push(item.value);
      }
    });
    const negativesResult = negatives.reduce((ant, post) => ant + post, 0);
    const positiveResult = positives.reduce((ant, post) => ant + post, 0);
    setSaldo(-negativesResult + positiveResult);
  };

  const loadSales = () => {
    setLoading(true);
    api.get(`/sales/${route.params.id}`).then((response) => {
      setSales(response.data.sales);
      CalculateSales(response.data.sales);
    });
    setLoading(false);
  };

  const removeSale = async (id) => {
    setRegistering(true);
    const response = await api.delete(`/sales/${id}`);
    setRegistering(false);
    if (response.status == 200) {
      notifyMessage("Deletado com sucesso!");
      onRefresh();
    } else {
      notifyMessage("Houve um erro ao deletar, tente novamente!");
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  return (
    <View
      style={
        modalVisible ? { ...styles.container, opacity: 0.3 } : styles.container
      }
    >
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("Cliente");
        }}
        style={styles.BackButton}
      >
        <Icon name="arrow-left" size={20} color="#FFF" />
      </TouchableOpacity>
      <View style={styles.containerStatus}>
        <Text style={{ marginTop: 13, fontSize: 15, color: "#545454" }}>
          Saldo
        </Text>
        <Text
          style={{
            marginTop: 5,
            fontWeight: "bold",
            fontSize: 20,
            color: saldo >= 0 ? "#3cb55c" : '#b53c3c',
          }}
        >
          R$ {saldo}
        </Text>
      </View>
      <View style={styles.removerContainer}>
          <Dialog
            visible={visible}
            footer={
              <DialogFooter>
                <DialogButton
                  text="Cancelar"
                  onPress={() => {
                    setVisible(false);
                  }}
                />
                <DialogButton
                  style={{backgroundColor: '#ff6e6e'}}
                  textStyle={{color: 'white'}}
                  text="Deletar"
                  onPress={() => {
                    removeSale(sale._id);
                    setVisible(false);
                  }}
                />
              </DialogFooter>
            }
          >
            <DialogContent>
               <FontAwesome
                style={{ alignSelf: "center" }}
                name="trash"
                size={70}
              /> 
              <Text style={{ fontSize: 15 }}>
                Você deseja remover?
              </Text>
            </DialogContent>
          </Dialog>
        </View>
      <View style={styles.containerProfile}>
        <FontAwesome name="user-circle" size={100} color="black" />
        <Text style={styles.clientName}>{route.params.name}</Text>
        {loading || registering ? (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <ActivityIndicator size="large" color="#4079ff" />
          </View>
        ) : (
          <FlatList
            data={sales}
            onRefresh={onRefresh}
            refreshing={refresh}
            renderItem={({ item, index }) => {
              return (
                <>
                  {item.type == 1 ? (
                    <TouchableOpacity 
                    onLongPress={() => {
                      setVisible(true);
                      setSale(item);
                    }}
                    style={styles.salesNegative}>
                      <FontAwesome
                        style={styles.salesIcon}
                        name="minus-square"
                        size={25}
                        color="#ff6e6e"
                      />
                      <Text style={styles.salesCash}>R$ {item.value}</Text>
                      <Text style={styles.salesDescription}>
                        {item.description}
                      </Text>
                      <Text style={styles.salesDate}>
                        {Moment(item.created_at).format("DD/MM/YYYY")}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onLongPress={() => {
                      setVisible(true);
                      setSale(item);
                    }} style={styles.salesPositive}>
                      <FontAwesome
                        style={styles.salesIcon}
                        name="plus-square"
                        size={25}
                        color="#69b347"
                      />
                      <Text style={styles.salesCash}>R$ {item.value}</Text>
                      <Text style={styles.salesDescription}>
                        {item.description}
                      </Text>
                      <Text style={styles.salesDate}>
                        {Moment(item.created_at).format("DD/MM/YYYY")}
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              );
            }}
            keyExtractor={(item, index) => {
              return index.toString();
            }}
          />
        )}
      </View>
      <ActionButton size={65} buttonColor="#3498db">
        <ActionButton.Item
          buttonColor="#25cc28"
          title="Abater venda"
          onPress={() => {
            setModalVisible(true);
            setType(2);
          }}
        >
          <Icon name="user-minus" style={styles.actionButtonIcon} />
        </ActionButton.Item>
        <ActionButton.Item
          buttonColor="rgba(231,44,66,1)"
          title="Adicionar venda"
          onPress={() => {
            setModalVisible(true);
            setType(1);
          }}
        >
          <Icon name="user-plus" style={styles.actionButtonIcon} />
        </ActionButton.Item>
      </ActionButton>
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.centeredView}>
          <View
            style={
              type == 1
                ? {
                    ...styles.modalView,
                    backgroundColor: "rgba(231, 44, 66, 1)",
                  }
                : {
                    ...styles.modalView,
                    backgroundColor: "#47b03c",
                  }
            }
          >
            <View style={styles.SalesContainer}>
              <View style={styles.SalesFormView}>
                <Text style={styles.logoText}>
                  {type == 1 ? "Adicionar Venda" : "Abater Venda"}
                </Text>
                <TextInput
                  placeholder="Descrição"
                  placeholderColor="#c4c3cb"
                  style={styles.TextInput}
                  autoFocus={true}
                  onChangeText={(text) => setDescription(text)}
                />
                <TextInput
                  placeholder="Valor"
                  placeholderColor="#c4c3cb"
                  keyboard={"numeric"}
                  keyboardType={"numeric"}
                  maxLength={8}
                  style={styles.TextInput}
                  onChangeText={(text) => setValue(text)}
                />
                <TouchableOpacity
                  style={styles.adicionarButton}
                  onPress={() => {
                    addSale();
                  }}
                >
                  <Text style={{ color: "white", fontSize: 17 }}>
                    Adicionar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalVisible(!modalVisible);
                setType(null);
              }}
            >
              <FontAwesome name="close" size={35} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
    paddingTop: 50,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  containerStatus: {
    position: "absolute",
    width: 130,
    height: 80,
    right: 10,
    top: 70,
    borderRadius: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 0.54,
    elevation: 4,
  },
  BackButton: {
    position: "absolute",
    width: 50,
    height: 50,
    backgroundColor: "#4079ff",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    top: 0,
    left: 0,
    marginTop: 50,
    marginLeft: 20,
  },
  containerProfile: {
    marginTop: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  clientName: {
    fontSize: 25,
    color: "#424242",
    marginBottom: 20,
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
    top: 19,
  },
  salesCash: {
    left: 30,
    color: "#545454",
    fontSize: 18,
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
    top: 5,
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: "white",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoText: {
    fontSize: 25,
    fontWeight: "800",
    marginBottom: 15,
    textAlign: "center",
    color: "white",
  },
  TextInput: {
    width: 250,
    height: 43,
    fontSize: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#eaeaea",
    backgroundColor: "#fafafa",
    paddingLeft: 10,
    marginLeft: 15,
    marginRight: 15,
    marginTop: 5,
    marginBottom: 5,
  },
  adicionarButton: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    width: 150,
    backgroundColor: "#404040",
    borderRadius: 5,
    height: 60,
    marginTop: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  closeButton: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    shadowColor: "#000",
    borderRadius: 40,
    elevation: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: "absolute",
    top: -15,
    right: -8,
  },
});
