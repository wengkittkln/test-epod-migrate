import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import * as Constants from '../../../../CommonConfig/Constants';
import moment from 'moment';
import {translationString} from '../../../../Assets/translation/Translation';
import CloseButton from '../../../../Assets/image/icon_close.png';

function EsignJobDetail({
  job,
  orderNumber,
  totalQuantity,
  orderItemList,
  children,
}) {
  const isChinese = job.language === 'C';
  const [udfsModalVisible, setUdfsModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const jobUdfs = getJobUdfs();

  function getJobItemFromOrderItemList() {
    return orderItemList.filter((item) => item.jobId === job.id);
  }

  function getTotalJobItemQuantity() {
    return getJobItemFromOrderItemList().reduce(
      (acc, item) => acc + item.quantity,
      0,
    );
  }

  function getJobUdfs() {
    if (job.udfsJson == null) {
      console.log('Job Udfs JSON is null or empty');
      return [];
    }

    try {
      const udfsArray = JSON.parse(job.udfsJson);

      if (Array.isArray(udfsArray)) {
        return udfsArray.map((udf) => ({
          field: udf.field || udf.Field || 'Unknown Field',
          value: udf.value || udf.Value || '',
        }));
      } else {
        console.log('Parsed data is not an array');
        return [];
      }
    } catch (error) {
      console.log('Error parsing JSON', error);
      return [];
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{job.customer.customerCode}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>
          {isChinese ? '訂單編號:' : 'Order Number:'}
        </Text>
        <Text style={styles.value}>{orderNumber}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label} />
        <TouchableOpacity onPress={() => setDetailModalVisible(true)}>
          <Text style={styles.viewMore}> {translationString.viewDetail}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={detailModalVisible} transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.rowContainer}>
              <TouchableOpacity
                style={styles.closeButtonContainer}
                onPress={() => {
                  setDetailModalVisible(false);
                }}>
                <Image source={CloseButton} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.section}>
                <Text style={styles.label}>
                  {isChinese ? '訂單日期:' : 'Order Date:'}
                </Text>
                <Text style={styles.value}>
                  {moment(job.createdDate).format('YYYY-MM-DD HH:mm')}
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>
                  {isChinese ? '交貨日期:' : 'Delivery Date:'}
                </Text>
                <Text style={styles.value}>
                  {moment(job.requestArrivalTimeFrom).format(
                    'YYYY-MM-DD HH:mm',
                  )}
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>
                  {isChinese ? '金額:' : 'Amount:'}
                </Text>
                <Text style={styles.value}>
                  {job.codCurrency ? job.codCurrency : '$'}
                  {job.codAmount}
                </Text>
              </View>

              {jobUdfs.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.label}>{'Udfs:'}</Text>

                  <TouchableOpacity onPress={() => setUdfsModalVisible(true)}>
                    <Text style={styles.viewMore}>
                      {translationString.viewDetail}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <Modal visible={udfsModalVisible} transparent>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <View style={styles.rowContainer}>
                      <TouchableOpacity
                        style={styles.closeButtonContainer}
                        onPress={() => {
                          setUdfsModalVisible(false);
                        }}>
                        <Image source={CloseButton} />
                      </TouchableOpacity>
                    </View>

                    <ScrollView>
                      <View style={styles.tableRowHeader}>
                        <Text style={[styles.indexCell, styles.title]}>#</Text>
                        <Text style={[styles.tableCell, styles.title]}>
                          {translationString.field}
                        </Text>
                        <Text style={[styles.tableCell, styles.title]}>
                          {translationString.value}
                        </Text>
                      </View>

                      {jobUdfs.map((udf, index) => (
                        <View key={index} style={styles.tableRow}>
                          <Text style={styles.indexCell}>{index + 1}</Text>
                          <Text style={styles.tableCell}>{udf.field}</Text>
                          <Text style={styles.tableCell}>{udf.value}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </Modal>

              <Text style={styles.subTitle}>
                {isChinese ? '訂單項目:' : 'Order Items:'}
              </Text>
              <Text style={styles.subContent}>
                {isChinese ? '總數量:' : 'Total Qty:'}{' '}
                {getTotalJobItemQuantity()} {isChinese ? '件' : 'Pcs'}
              </Text>

              <FlatList
                data={getJobItemFromOrderItemList()}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => (
                  <View style={styles.item}>
                    <Text style={styles.itemText}>
                      <Text style={styles.bold}>
                        {isChinese ? 'SKU編號:' : 'SKU:'}
                      </Text>
                      {item.sku}
                    </Text>
                    <Text style={styles.itemText}>
                      <Text style={styles.bold}>
                        {isChinese ? '數量:' : 'Qty:'}
                      </Text>
                      {item.quantity} {isChinese ? '件' : 'Pcs'}
                    </Text>
                    <Text style={styles.itemText}>
                      <Text style={styles.bold}>
                        {isChinese ? '描述:' : 'Description:'}
                      </Text>
                      {item.description}
                    </Text>
                  </View>
                )}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Text style={[styles.subTitle, {marginBottom: 5}]}>
        {isChinese ? '簽名:' : 'Signature:'}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Constants.WHITE,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  section: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    width: 150,
  },
  value: {
    flexShrink: 1,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  subContent: {
    fontSize: 15,
    fontWeight: '600',
  },
  item: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: 5,
    borderRadius: 5,
  },
  itemText: {
    fontSize: 14,
  },
  bold: {
    fontWeight: 'bold',
  },
  signature: {
    marginTop: 20,
    fontStyle: 'italic',
  },
  viewMore: {color: 'blue'},
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    maxHeight: '90%',
  },
  modalText: {fontSize: 16, marginBottom: 10},
  closeButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {color: 'white', fontWeight: 'bold'},
  tableRowHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 6,
  },
  tableCell: {
    flex: 3,
    textAlign: 'left',
    padding: 5,
  },
  indexCell: {
    flex: 0.5,
    textAlign: 'left',
    padding: 5,
  },
  rowContainer: {
    flexDirection: 'row',
  },
  closeButtonContainer: {
    flex: 1,
    paddingEnd: 5,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});

export default EsignJobDetail;
