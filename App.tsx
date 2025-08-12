import { useState } from 'react'
import {
  ChakraProvider,
  Box,
  VStack,
  Heading,
  Textarea,
  Button,
  Text,
  useToast,
  Container,
  Input,
  FormControl,
  FormLabel,
  Card,
  CardBody,
  Image,
  Stack,
} from '@chakra-ui/react'

function App() {
  const [input, setInput] = useState('')
  const [amount, setAmount] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const toast = useToast()

  const checkSQLInjection = async () => {
    try {
      // Replace this with your actual API endpoint
      const response = await fetch('http://localhost:5000/check-sql-injection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input }),
      })

      const data = await response.json()
      setResult(data.isSQLInjection ? 'SQL Injection Detected!' : 'No SQL Injection Detected')
      
      toast({
        title: data.isSQLInjection ? 'Warning!' : 'Safe',
        description: data.isSQLInjection 
          ? 'Potential SQL injection detected in the input.' 
          : 'Input appears to be safe.',
        status: data.isSQLInjection ? 'error' : 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check for SQL injection',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <ChakraProvider>
      <Container maxW="container.lg" py={10}>
        <VStack spacing={6} align="stretch">
          <Box textAlign="center" mb={8}>
            <Heading as="h1" size="xl" color="blue.600" mb={2}>
              SecureBank Transfer
            </Heading>
            <Text color="gray.600">Secure Money Transfer Portal</Text>
          </Box>

          <Card>
            <CardBody>
              <VStack spacing={6}>
                <Image
                  src="https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=800&q=80"
                  borderRadius="lg"
                  alt="Banking Security"
                  maxH="200px"
                  objectFit="cover"
                  width="100%"
                />

                <FormControl>
                  <FormLabel>Account Number / Username</FormLabel>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter account number or username"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Amount (USD)</FormLabel>
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount to transfer"
                    type="number"
                  />
                </FormControl>

                <Button
                  colorScheme="blue"
                  onClick={checkSQLInjection}
                  isDisabled={!input.trim()}
                  width="full"
                  size="lg"
                >
                  Process Transfer
                </Button>

                {result && (
                  <Box
                    p={4}
                    bg={result.includes('Detected') ? 'red.100' : 'green.100'}
                    borderRadius="md"
                    width="full"
                  >
                    <Text
                      fontSize="lg"
                      color={result.includes('Detected') ? 'red.600' : 'green.600'}
                      fontWeight="bold"
                      textAlign="center"
                    >
                      {result.includes('Detected') 
                        ? '🚫 Security Alert: Potential SQL Injection Detected!' 
                        : '✅ Transaction Verified - Processing Transfer'}
                    </Text>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>

          <Text fontSize="sm" color="gray.500" textAlign="center">
            Protected by SecureBank Anti-SQL Injection System
          </Text>
        </VStack>
      </Container>
    </ChakraProvider>
  )
}

export default App
