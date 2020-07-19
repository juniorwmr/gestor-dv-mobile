import React, { useState, useEffect, useRef } from "react";
import call from "react-native-phone-call";
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
import {
  Feather as Icon,
  FontAwesome,
  MaterialIcons,
} from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";
import Dialog, {
  DialogFooter,
  DialogButton,
  DialogContent,
} from "react-native-popup-dialog";

import api from "../services/api";

export default function Clients() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [clients, setClients] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState([]);
  const [visible, setVisible] = useState(false);
  const [client, setClient] = useState({});

  function notifyMessage(msg) {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      AlertIOS.alert(msg);
    }
  }

  const loadClients = async () => {
    setLoading(true);
    const { data } = await api.get("/clients");
    setClients(data.clients);
    setFilter(data.clients);
    setLoading(false);
  };

  async function onRefresh() {
    setRefresh(true);
    await loadClients();
    setRefresh(false);
  }

  useEffect(() => {
    loadClients();
  }, []);

  const addClient = async () => {
    setRegistering(true);
    const response = await api.post("/clients", {
      name,
      phone,
    });
    setRegistering(false);
    setModalVisible(false);
    if (response.status == 200) {
      notifyMessage("Cadastrado com sucesso!");
      onRefresh();
    } else {
      notifyMessage("Houve um erro ao cadastrar, tente novamente!");
    }
  };

  const removeClient = async (id) => {
    setRegistering(true);
    const response = await api.delete(`/clients/${id}`);
    setRegistering(false);
    if (response.status == 200) {
      notifyMessage("Deletado com sucesso!");
      onRefresh();
    } else {
      notifyMessage("Houve um erro ao deletar, tente novamente!");
    }
  };

  function SearchFilterFunction(text) {
    const newData = clients.filter(function (item) {
      //applying filter for the inserted text in search bar
      const itemData = item.name ? item.name.toUpperCase() : "".toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    setFilter(newData);
    setSearch(text);
  }

  return (
    <View
      style={
        modalVisible ? { ...styles.container, opacity: 0.3 } : styles.container
      }
    >
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={30} />
        <TextInput
          style={styles.searchText}
          onChangeText={(text) => SearchFilterFunction(text)}
          value={search}
          underlineColorAndroid="transparent"
          placeholder="Pesquisar cliente"
        />
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
                  text="Deletar"
                  onPress={() => {
                    removeClient(client._id);
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
                Você deseja remover{" "}
                <Text style={{ fontWeight: "bold" }}>{client.name}</Text>?
              </Text>
            </DialogContent>
          </Dialog>
        </View>
      </View>
      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color="#4079ff" />
        </View>
      ) : (
        <FlatList
          data={filter}
          onRefresh={onRefresh}
          refreshing={refresh}
          enableEmptySections={true}
          renderItem={({ item, index }) => {
            return (
              <TouchableOpacity
                onLongPress={() => {
                  setVisible(true);
                  setClient(item);
                }}
                onPress={() => {
                  navigation.navigate("Profile", {
                    id: item._id,
                    name: item.name,
                    phone: item.phone,
                  });
                }}
                style={styles.containerClients}
              >
                <Text style={styles.clientName}>{item.name}</Text>
                <View style={styles.clientContacts}>
                  <TouchableOpacity
                    onPress={() => {
                      call({ number: item.phone });
                    }}
                    style={styles.CallButton}
                  >
                    <MaterialIcons name="call" size={22} color="black" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.WhatsappButton}
                    onPress={() => {
                      Linking.openURL(`whatsapp://send?phone=55${item.phone}`);
                    }}
                  >
                    <FontAwesome
                      style={styles.WhatsappIcon}
                      name="whatsapp"
                      color="white"
                      size={30}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item, index) => index.toString()}
        />
      )}

      <TouchableOpacity
        onPress={() => {
          setModalVisible(true);
        }}
        style={styles.addClient}
      >
        <Icon name="plus" size={30} color="#FFF" />
      </TouchableOpacity>

      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {registering ? (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ActivityIndicator size="large" color="#4079ff" />
              </View>
            ) : (
              <View style={styles.loginScreenContainer}>
                <View style={styles.loginFormView}>
                  <Text style={styles.logoText}>Cadastrar Cliente</Text>
                  <TextInput
                    placeholder="Nome Completo"
                    placeholderColor="#c4c3cb"
                    style={styles.TextInput}
                    autoFocus={true}
                    onChangeText={(text) => setName(text)}
                  />
                  <TextInput
                    placeholder="6898456565"
                    placeholderColor="#c4c3cb"
                    keyboard={"numeric"}
                    keyboardType={"numeric"}
                    maxLength={11}
                    style={styles.TextInput}
                    onChangeText={(text) => setPhone(text)}
                  />
                  <TouchableOpacity
                    style={styles.cadastrarButton}
                    onPress={() => {
                      addClient();
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 17 }}>
                      Cadastrar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalVisible(!modalVisible);
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
    justifyContent: "center",
  },
  searchContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  searchText: {
    width: width - 100,
    height: 50,
    margin: 10,
    fontSize: 17,
    borderWidth: 1,
    paddingLeft: 10,
    borderColor: "#009688",
    backgroundColor: "#FFFFFF",
  },
  containerClients: {
    flex: 1,
    backgroundColor: "#cec5",
    borderRadius: 20,
    width: width,
    marginBottom: 10,
    padding: 20,
  },
  clientName: {
    fontSize: 16,
    left: 0,
  },
  clientContacts: {
    position: "absolute",
    display: "flex",
    flexDirection: "row",
    right: 0,
    top: 11,
  },
  CallButton: {
    width: 40,
    height: 40,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#cecece",
    marginRight: 10,
  },
  WhatsappButton: {
    width: 40,
    height: 40,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "green",
    marginRight: 10,
  },
  addClient: {
    position: "absolute",
    width: 60,
    height: 60,
    backgroundColor: "#4079ff",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    bottom: 0,
    margin: 20,
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
  closeButton: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    shadowColor: "#000",
    borderRadius: 40,
    elevation: 1,
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
  logoText: {
    fontSize: 25,
    fontWeight: "800",
    marginBottom: 15,
    textAlign: "center",
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
  cadastrarButton: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    width: 100,
    backgroundColor: "#3897f1",
    borderRadius: 5,
    height: 45,
    marginTop: 20,
  },
});
