import React, { useCallback, useRef }from 'react';
import  { KeyboardAvoidingView, Platform, View, TextInput, ScrollView, Alert} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';
import Icon from 'react-native-vector-icons/Feather';

import * as Yup from 'yup';
import Input from '../../components/Input';
import Button from '../../components/Button';
import getValidationErrors from '../../utils/getValidationErrors';
import api from '../../services/api';
import ImagePicker from 'react-native-image-picker';
import { useAuth } from '../../hooks/auth';
import  { Container, Title, BackButton, UserAvatarButton, UserAvatar }  from './styles';

interface ProfileFormData{
  name: string;
  email: string;
  old_password: string;
  password: string;
  password_confirmation: string;
}



const Profile: React.FC =() => {
  const { user, updateUser } = useAuth();

  const formRef = useRef<FormHandles>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const oldPasswordInputRef = useRef<TextInput>(null);
  const passwordConfirmationInputRef = useRef<TextInput>(null);

  const navigation = useNavigation();

  const handleSignUp = useCallback(
    async (data: ProfileFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required('Nome obrigatório'),

          email: Yup.string()
            .email('Digite um e-mail válido')
            .required('E-mail obrigatório'),

          old_password: Yup.string(),

          password: Yup.string().when('old_password' , {
            is: val => !!val.length,
            then: Yup.string().required('Campo obrigatório'),
            otherwise: Yup.string(),
          }),

          password_confirmation: Yup.string().when('old_password' , {
            is: val => !!val.length,
            then: Yup.string().required('Campo obrigatório'),
            otherwise: Yup.string(),
          }).oneOf([Yup.ref('password'), undefined], 'Confirmação incorreta'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        const {name, email, old_password, password, password_confirmation} = data;

        const formData = Object.assign({
          name,
          email,
        }, data.old_password ? {
            old_password,
            password,
            password_confirmation,
        }: {});

        const response = await api.put('profile', formData);

        updateUser(response.data);

        Alert.alert('Perfil atualizado com sucesso')
        navigation.goBack();

      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          return;
        }

        Alert. alert('Erro na atualização de perfil','Ocorreu um erro ao fazer a atualização do perfil, tente novamente.');
      }
    },
    [navigation, updateUser],
  );
  const handleUpdateAvatar = useCallback(() => {

    ImagePicker.launchImageLibrary({
      /*title: 'Selecione um avatar',
      cancelButtonTitle: 'Cancelar',
      takePhotoButtonTitle: 'Usar camera',
      chooseFromLibraryButtonTitle: 'Escolher da galeria', */
      mediaType:'photo',
      includeBase64: true,
      maxHeight: 186,
      maxWidth: 186,
    }, response => {
      if(response.didCancel) return;
      if(response.errorCode){
        Alert.alert('Erro ao atualizar seu avatar.');
        return;
      }

      const data = new FormData();
      data.append('avatar', {
        type: 'image/jpeg',
        name: `${user.id}.jpeg`,
        uri: response.uri,

      });

      api.patch('users/avatar', data).then(apiResponse => {
        updateUser(apiResponse.data);
      });

    });
   } , [updateUser, user.id])

  const handleGoBack = useCallback(() => {
    navigation.goBack();
   } , [navigation.goBack])


  return (
  <>
    <KeyboardAvoidingView enabled
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined }>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle= {{flex: 1}}>

        <Container>
          <BackButton onPress={handleGoBack}>
            <Icon name="chevron-left" size={24} color="#999591" />
          </BackButton>

          <UserAvatarButton onPress={handleUpdateAvatar}>
            <UserAvatar source={{ uri: user.avatar_url }}/>
          </UserAvatarButton>


          <View>
            <Title>Meu Perfil</Title>
          </View>

          <Form initialData={user} ref={formRef} onSubmit={handleSignUp}>
            <Input
              name ="name"
              icon="user"
              placeholder="Nome"
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => {
                emailInputRef.current?.focus();
              }}

            />

            <Input
              ref={emailInputRef}
              name ="email"
              icon="mail"
              placeholder="E-mail"
              keyboardType="email-address"
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => {
                oldPasswordInputRef.current?.focus();
              }}
            />
            <Input
              ref={oldPasswordInputRef}
              name ="old_password"
              icon="lock"
              placeholder="Senha antiga"
              secureTextEntry
              textContentType="newPassword"
              returnKeyType="next"
              containerStyle={{marginTop: 16}}
              onSubmitEditing={() => {
                passwordInputRef.current?.focus();
              }}
            />

            <Input
              ref={passwordInputRef}
              name ="password"
              icon="lock"
              placeholder="Senha"
              secureTextEntry
              textContentType="newPassword"
              returnKeyType="next"
              onSubmitEditing={() => {
                passwordConfirmationInputRef.current?.focus();
              }}
            />


            <Input
              ref={passwordConfirmationInputRef}
              name ="password_confirmation"
              icon="lock"
              placeholder="Confirmar senha"
              secureTextEntry
              textContentType="newPassword"
              returnKeyType="send"
              onSubmitEditing={() => formRef.current?.submitForm( )}
            />

              <View>
                <Button onPress={() => formRef.current?.submitForm( )}>Confirmar mudanças</Button>
              </View>
          </Form>

        </Container>
      </ScrollView>
    </KeyboardAvoidingView>
  </>
  );
}
export default Profile;
