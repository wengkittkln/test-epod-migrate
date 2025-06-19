import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Constants from '../../CommonConfig/Constants';
import { translationString } from "../../Assets/translation/Translation";
import { FC } from "react";
import Modal from 'react-native-modal';

type CustomDialogProps = {
    title?: string
    description?: string
    leftText?: string,
    rightText?: string,
    onLeftClick?: () => void,
    onRightClick?: () => void,
    isError: boolean,
    isShow: boolean,
    customEvent?: () => void,
}

export const CustomDialogView: FC<CustomDialogProps> = (props) => {
    const {
        title,
        description,
        leftText,
        rightText,
        onLeftClick,
        onRightClick,
        isError,
        isShow,
        customEvent,
    } = props

    const windowWidth = Dimensions.get('screen').width;

    return (
        <Modal
            coverScreen={true}
            isVisible={isShow}>
            <View style={[styles.modelView, {width: windowWidth * 0.9}]}>
                <Text style={styles.modelTitle}>{title}</Text>
                <Text style={styles.modelDesc}>{description}</Text>
                {props.children}
                <View style={styles.divider} />
                <View style={styles.bottomButtonContainer}>
                    {
                        !isError &&
                        <TouchableOpacity
                            style={styles.cancelButtonContainer}
                            onPress={() => {
                                onLeftClick()
                            }}>
                            <Text style={styles.cancelModelButton}>
                                {leftText ?? translationString.cancel}
                            </Text>
                        </TouchableOpacity>
                    }

                    <TouchableOpacity
                        style={
                            isError
                                ? styles.confirmModalFailButtonContainer
                                : styles.confirmModalButtonContainer
                        }
                        onPress={() => {
                            onRightClick()
                        }}>
                        <Text style={styles.confirmModelButton}>
                            {rightText ?? translationString.confirm}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}
const styles = StyleSheet.create({
    modelDesc: {
        fontSize: 20,
        paddingBottom: 45,
        paddingHorizontal: 24,
        alignSelf: 'center',
        color: Constants.Dark_Grey,
    },
    modelView: {
        width: '100%',
        backgroundColor: Constants.WHITE,
        alignSelf: 'center',
        borderRadius: 8,
    },
    modelTitle: {
        fontSize: 20,
        alignSelf: 'center',
        paddingTop: 16,
        paddingBottom: 8,
        color: Constants.Dark_Grey,
    },
    bottomButtonContainer: {
        flexDirection: 'row',
    },
    confirmModalButtonContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: Constants.Completed_Color,
        borderBottomRightRadius: 8,
    },
    confirmModalFailButtonContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: Constants.Failed_Color,
        borderBottomRightRadius: 8,
        borderBottomLeftRadius: 8,
    },
    confirmModelButton: {
        fontSize: 18,
        color: Constants.WHITE,
        alignSelf: 'center',
        paddingVertical: 28,
        paddingHorizontal: 16,
    },
    divider: {
        marginVertical: 9,
        backgroundColor: '#00000029',
        height: 1,
    },
    cancelButtonContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: Constants.Light_Grey,
        borderBottomLeftRadius: 8,
    },
    cancelModelButton: {
        fontSize: 18,
        color: Constants.Dark_Grey,
        alignSelf: 'center',
        paddingVertical: 24,
        paddingHorizontal: 16,
    }
});
