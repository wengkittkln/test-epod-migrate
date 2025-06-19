import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import {translationString} from '../../Assets/translation/Translation';

const JobRequestModal = ({
  visible,
  request,
  onApprove,
  onReject,
  onClose,
  type = 'pending',
}) => {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (!request) return null;

  const getModalTitle = () => {
    switch (type) {
      case 'pending':
        return translationString.job_request_title;
      case 'sent':
        return translationString.sent_request_title;
      case 'available':
        return translationString.available_job_title;
      default:
        return translationString.job_request_title;
    }
  };

  const getModalMessage = () => {
    if (!request || !request.jobId) return '';

    switch (type) {
      case 'pending':
        return translationString.formatString(
          translationString.job_request_message,
          request.requesterUserName || '',
          request.jobId,
        );
      case 'sent':
        return translationString.formatString(
          translationString.sent_request_message,
          request.jobId,
          getStatusText(request.status || ''),
        );
      case 'available':
        return translationString.formatString(
          translationString.available_job_message,
          request.jobId,
        );
      default:
        return '';
    }
  };

  const getStatusText = (text) => {
    switch (type) {
      case 'pending':
        return translationString.pending || 'Pending';
      case 'sent':
        return text.toUpperCase() === 'APPROVED'
          ? translationString.approved || 'Approved'
          : text.toUpperCase() === 'REJECTED'
          ? translationString.job_transfers.rejected
          : translationString.pending || 'Pending';
      case 'available':
        return translationString.available || 'Available';
      default:
        return '';
    }
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      return;
    }
    onReject(rejectReason);
    setRejectReason('');
    setShowRejectDialog(false);
  };

  const renderButtons = () => {
    let containerStyle = styles.buttonContainer;
    if (type === 'available') {
      containerStyle = {...containerStyle, justifyContent: 'center'};
    }
    switch (type) {
      case 'pending':
        return (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.approveButton]}
              onPress={onApprove}>
              <Text style={styles.buttonText}>{translationString.approve}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={() => setShowRejectDialog(true)}>
              <Text style={styles.buttonText}>{translationString.reject}</Text>
            </TouchableOpacity>
          </View>
        );
      case 'available':
        return (
          <View style={containerStyle}>
            <TouchableOpacity
              style={[styles.button, styles.requestButton]}
              onPress={() => onApprove(request.jobId)}>
              <Text style={styles.buttonText}>
                {translationString.request_job}
              </Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{getModalTitle()}</Text>
          <Text style={styles.modalText}>{getModalMessage()}</Text>
          {renderButtons()}
        </View>

        {/* Reject Dialog */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showRejectDialog}
          onRequestClose={() => setShowRejectDialog(false)}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>
                {translationString.please_enter_reason || 'Please enter reason'}
              </Text>
              <TextInput
                style={styles.reasonInput}
                multiline
                numberOfLines={4}
                value={rejectReason}
                onChangeText={setRejectReason}
                placeholder={
                  translationString.enter_reason_placeholder ||
                  'Enter reason for rejection'
                }
              />
              <View style={styles.dialogButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setShowRejectDialog(false);
                    setRejectReason('');
                  }}>
                  <Text style={styles.buttonText}>
                    {translationString.cancel || 'Cancel'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={handleReject}>
                  <Text style={styles.buttonText}>
                    {translationString.confirm || 'Confirm'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    width: '45%',
    alignItems: 'center',
    backgroundColor: 'grey',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  requestButton: {
    backgroundColor: '#ED6D00',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  confirmButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reasonInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default JobRequestModal;
