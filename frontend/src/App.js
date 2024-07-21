import React, { useState } from 'react';
import axios from 'axios';
import {
  ChakraProvider,
  Box,
  VStack,
  Heading,
  Input,
  Button,
  List,
  ListItem,
  Text,
  useToast,
  Spinner,
} from '@chakra-ui/react';

function App() {
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [sentences, setSentences] = useState(Array(10).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('https://keyword-marketing-generator-mmw4lyxt.devinapps.com/scan', { url });
      setKeywords(response.data.keywords);
      setSentences(response.data.sentences);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      status: 'success',
      duration: 2000,
    });
  };

  const handleGenerateNew = async (index) => {
    setIsLoading(true);
    try {
      const response = await axios.post('https://keyword-marketing-generator-mmw4lyxt.devinapps.com/generate', { keywords, length: 60 });
      setSentences(prev => {
        const newSentences = [...prev];
        newSentences[index] = response.data.sentence;
        return newSentences;
      });
    } catch (error) {
      console.error('Error generating new sentence:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate new sentence. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChakraProvider>
      <Box maxWidth="800px" margin="auto" padding={8}>
        <VStack spacing={8} align="stretch">
          <Heading textAlign="center">Keyword and Marketing Sentences Generator</Heading>

          <form onSubmit={handleSubmit}>
            <VStack>
              <Input
                placeholder="Enter website URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Button type="submit" colorScheme="blue" width="full" isLoading={isLoading}>
                {isLoading ? <Spinner /> : 'Start Scan'}
              </Button>
            </VStack>
          </form>

          {isLoading ? (
            <Box textAlign="center">
              <Spinner size="xl" />
              <Text mt={4}>Processing...</Text>
            </Box>
          ) : (
            <>
              {keywords.length > 0 && (
                <Box>
                  <Heading size="md" mb={2}>Keywords</Heading>
                  <List spacing={2}>
                    {keywords.map((keyword, index) => (
                      <ListItem key={index} display="flex" justifyContent="space-between" alignItems="center">
                        <Text>{keyword}</Text>
                        <Button size="sm" onClick={() => handleCopy(keyword)}>Copy</Button>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {sentences.map((sentence, index) => (
                <Box key={index}>
                  <Text fontWeight="bold">Sentence {index + 1}:</Text>
                  <Text mb={2}>{sentence}</Text>
                  <Button size="sm" mr={2} onClick={() => handleCopy(sentence)}>Copy</Button>
                  <Button size="sm" onClick={() => handleGenerateNew(index)} isLoading={isLoading}>
                    Generate New
                  </Button>
                </Box>
              ))}
            </>
          )}
        </VStack>
      </Box>
    </ChakraProvider>
  );
}

export default App;
