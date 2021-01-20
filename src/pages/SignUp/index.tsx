import React, { useCallback, useRef }from 'react';
import  { Image , KeyboardAvoidingView, Platform, View, TextInput, ScrollView, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';

import * as Yup from 'yup';

import Input from '../../components/Input';
import Button from '../../components/Button';
import logoImg from '../../assets/logo.png';
import getValidationErrors from '../../utils/getValidationErrors';
import api from '../../services/api';

import  { Container, Title, BackToSignIn, BackToSignInText}  from './styles';

interface SignUpFormData{
  name: string;
  email: string;
  password: string;
}


const SignUp: React.FC =() => {
  const formRef = useRef<FormHandles>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const navigation = useNavigation();

  const handleSignUp = useCallback(
    async (data: SignUpFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required('Nome obrigatório'),
          email: Yup.string()
            .email('Digite um e-mail válido')
            .required('E-mail obrigatório'),
          password: Yup.string().min(6, 'No mínimo 6 dígitos'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        await api.post('/users', data);

        Alert.alert('Cadastro realizado com sucesso', 'Voce ja pode fazer login na aplicação.')
        navigation.navigate('SignIn');

      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          return;
        }

        Alert. alert('Erro no cadastro','Ocorreu um erro ao fazer cadastro, tente novamente.');
      }
    },
    [navigation],
  );


  return (
  <>
    <KeyboardAvoidingView enabled
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined }>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle= { {flex: 1}}>
        <Container>
          <Image source={logoImg} />

          <View>
            <Title>Crie sua conta</Title>
          </View>
          <Form ref={formRef} onSubmit={handleSignUp}>
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
              returnKeyType="send"
              onSubmitEditing={() => formRef.current?.submitForm( )}
            />

              <View>
                <Button onPress={() => formRef.current?.submitForm( )}>Entrar</Button>
              </View>
          </Form>

        </Container>
      </ScrollView>
    </KeyboardAvoidingView>

      <BackToSignIn onPress={() => navigation.navigate('SignIn')}>
        <Icon name="arrow-left" size={20} color="#f4ede8"/>
        <BackToSignInText>Voltar para logon</BackToSignInText>
      </BackToSignIn>
  </>
  );
}
export default SignUp;
