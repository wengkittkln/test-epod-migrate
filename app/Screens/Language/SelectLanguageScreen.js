import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import * as Constants from '../../CommonConfig/Constants';
import {useSelectLanguage} from '../../Hooks/Language/useSelectLanguage';

export default ({navigation}) => {
  const {languageModel, itemOnSelect} = useSelectLanguage(navigation);

  return (
    <SafeAreaView style={styles.baseContainer}>
      <FlatList
        data={Constants.languageList}
        renderItem={({item}) => {
          const fontFamily =
            item.code === languageModel.code
              ? Constants.NoboSansBoldFont
              : Constants.NoboSansFont;

          const fontColor =
            item.code === languageModel.code
              ? '#000000'
              : Constants.Disable_Color;

          return (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => itemOnSelect(item)}>
              <Text
                style={[
                  styles.itemTitle,
                  {fontFamily: fontFamily, color: fontColor},
                ]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id.toString()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  itemContainer: {
    padding: 16,
  },
  itemTitle: {
    fontSize: 18,
    fontFamily: Constants.fontFamily,
    color: 'rgb(116, 116, 116)',
  },
});
