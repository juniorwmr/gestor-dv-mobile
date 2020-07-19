import React from "react";

import { StyleSheet, TouchableOpacity, View, Modal, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function MyModal({ children, modalVisible }) {
  return (
    <Modal animationType="slide" transparent={true} visible={modalVisible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {children}
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
  );
}

const styles = StyleSheet.create({});
