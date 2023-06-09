import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { storage } from "../../firebase/config";

import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";

import addAvatar from "../../assets/icons/addAvatar.png";
import removeAvatar from "../../assets/icons/removeAvatar.png";

import {
  authChangeAvatarUser,
} from "../../redux/auth/authOperations";

const Avatar = () => {
  const [choosedImagePath, setChoosedImagePath] = useState("");
  const dispatch = useDispatch();
  const { avatarPath } = useSelector((state) => state.auth);

  useEffect(() => {
    if (avatarPath) {
      setChoosedImagePath(avatarPath);
    }
    if (!avatarPath) {
      setChoosedImagePath(null);
    }
  }, [avatarPath]);

  const pickAvatar = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const { uri } = result.assets[0];
        const downloadAvatar = await uploadAvatarToFirebaseStorage(uri);

        dispatch(authChangeAvatarUser({ avatarPath: downloadAvatar }));
        setChoosedImagePath(uri);
      }
    } catch (error) {
      console.log("error in  pickAvatar:>> ", error.message);
    }
  };

  const uploadAvatarToFirebaseStorage = async (avatarUri) => {
    try {
      if (avatarUri) {
        const response = await fetch(avatarUri);
        const blob = await response.blob();

        const filename = avatarUri.substring(avatarUri.lastIndexOf("/") + 1);
        const storageRef = ref(storage, `avatarsUsers/${filename}`);

        await uploadBytes(storageRef, blob);

        const downloadAvatar = await getDownloadURL(storageRef);
        return downloadAvatar;
      }
    } catch (error) {
      console.log("error in  uploadAvatarToFirebaseStorage:>> ", error.message);
    }
  };

  const deleteAvatar = async () => {
    setChoosedImagePath(null);
    dispatch(authChangeAvatarUser({ avatarPath: null }));
  };

  return (
    <View style={styles.avatarContainer}>
      {choosedImagePath && (
        <Image
          source={{ uri: choosedImagePath }}
          style={{ width: 120, height: 120, borderRadius: 16 }}
        />
      )}
      {!choosedImagePath ? (
        <TouchableOpacity
          activeOpacity={0.6}
          title="Pick an image from camera roll"
          onPress={pickAvatar}
          style={styles.btnSvg}
        >
          <Image source={addAvatar}></Image>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          activeOpacity={0.6}
          title="Pick an image from camera roll"
          onPress={deleteAvatar}
          style={styles.btnDeleteSvg}
        >
          <Image source={removeAvatar}></Image>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Avatar;

const styles = StyleSheet.create({
  avatarContainer: {
    position: "absolute",
    top: -60,
    left: "50%",
    transform: [{ translateX: -50 }],
    zIndex: 200,
    width: 120,
    height: 120,
    backgroundColor: "#F6F6F6",
    borderRadius: 16,
  },
  btnSvg: {
    position: "absolute",
    top: 81,
    left: 107,
    width: 25,
    height: 25,
    resizeMode: "cover",
    zIndex: 5,
    cursor: "pointer",
  },
  btnDeleteSvg: {
    position: "absolute",
    top: 79,
    left: 103,
    width: 25,
    height: 25,
    resizeMode: "cover",
    zIndex: 5,
    cursor: "pointer",
  },
});
