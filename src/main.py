import tensorflow as tf
from tensorflow import keras
from sklearn.model_selection import train_test_split
import pandas as pd
import numpy as np

gpus = tf.config.experimental.list_physical_devices('GPU')
if gpus:
  try:
    # Use the first GPU
    tf.config.experimental.set_visible_devices(gpus[0], 'GPU')
    print('Using GPU:', gpus[0])
  except RuntimeError as e:
    print(e)

# Load the dataset
data = pd.read_csv('./data/products-normalized-categories.csv', sep=r'\;')

# Split the dataset into training and testing sets
train, test = train_test_split(data, test_size=0.2)

# Tokenize the text
tokenizer = keras.preprocessing.text.Tokenizer()
tokenizer.fit_on_texts(train['description'])

# Convert text to sequence of integers
train_sequences = tokenizer.texts_to_sequences(train['description'])
test_sequences = tokenizer.texts_to_sequences(test['description'])

# Pad sequences so that they are all the same length
train_padded = keras.preprocessing.sequence.pad_sequences(train_sequences)
test_padded = keras.preprocessing.sequence.pad_sequences(test_sequences)

# Convert categories to numbers
category_tokenizer = keras.preprocessing.text.Tokenizer()
category_tokenizer.fit_on_texts(train['category'])

train_labels = category_tokenizer.texts_to_sequences(train['category'])
test_labels = category_tokenizer.texts_to_sequences(test['category'])

# Build the model
model = keras.models.Sequential([
    keras.layers.Embedding(10000, 16),
    keras.layers.GlobalAveragePooling1D(),
    keras.layers.Dense(16, activation='relu'),
    keras.layers.Dense(len(category_tokenizer.word_index)+1, activation='softmax')
])

# Compile the model
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# Train the model
model.fit(np.array(train_padded), np.array(train_labels), epochs=2)

# Evaluate the model on the test set
loss, accuracy = model.evaluate(test_padded, test_labels)
print(f'Loss: {loss}, Accuracy: {accuracy}')