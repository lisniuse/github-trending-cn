import React, { useState, useEffect } from 'react';
import { Modal, Input, Form, InputNumber, Radio, Message } from '@arco-design/web-react';
import { useTranslation } from 'react-i18next';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const electron = window.electron;

const SettingsModal = ({ visible, onClose }) => {
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (visible) {
      loadSettings();
    }
  }, [visible]);
  
  const loadSettings = async () => {
    try {
      setLoading(true);
      const apiKey = await electron.invoke('get-api-key');
      const updateInterval = await electron.invoke('get-update-interval');
      const language = await electron.invoke('get-language');
      const proxyUrl = await electron.invoke('get-proxy-url');
      
      form.setFieldsValue({
        apiKey,
        updateInterval,
        language,
        proxyUrl
      });
    } catch (error) {
      Message.error(t('errors.loadSettingsFailed'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    try {
      const values = await form.validate();
      setLoading(true);
      
      await electron.invoke('set-api-key', values.apiKey);
      await electron.invoke('set-update-interval', values.updateInterval);
      await electron.invoke('set-proxy-url', values.proxyUrl || '');
      
      if (values.language !== i18n.language) {
        await electron.invoke('set-language', values.language);
        i18n.changeLanguage(values.language);
      }
      
      Message.success(t('settings.saveSuccess'));
      onClose();
    } catch (error) {
      // 不显示具体的表单校验错误信息
      console.log('Form validation error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal
      title={t('settings.title')}
      visible={visible}
      onOk={handleSave}
      onCancel={onClose}
      confirmLoading={loading}
      maskClosable={false}
    >
      <Form form={form} layout="vertical" validateMessages={{
        required: (_, { label }) => `${label}${t('settings.required')}`
      }}>
        <FormItem
          label={t('settings.apiKey')}
          field="apiKey"
          rules={[{ required: true }]}
          extra={t('settings.apiKeyTip')}
        >
          <Input.Password placeholder={t('settings.apiKeyPlaceholder')} />
        </FormItem>
        
        <FormItem
          label={t('settings.updateInterval')}
          field="updateInterval"
          rules={[{ required: true }]}
        >
          <InputNumber
            min={1}
            max={24}
            placeholder={t('settings.updateIntervalPlaceholder')}
            suffix={t('settings.hours')}
          />
        </FormItem>
        
        <FormItem
          label={t('settings.proxyUrl')}
          field="proxyUrl"
          extra={t('settings.proxyTip')}
        >
          <Input placeholder={t('settings.proxyPlaceholder')} />
        </FormItem>
        
        <FormItem
          label={t('settings.language')}
          field="language"
        >
          <RadioGroup>
            <Radio value="zh">{t('settings.chinese')}</Radio>
            <Radio value="en">{t('settings.english')}</Radio>
          </RadioGroup>
        </FormItem>
      </Form>
    </Modal>
  );
};

export default SettingsModal;