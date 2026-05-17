"""
Template training ResNet50V2 untuk klasifikasi kualitas/layout screenshot.
Tugas ResNet: valid tracker / bukan tracker / blur / crop / light / dark.
Untuk ekstraksi angka tetap gunakan Vision API/OCR/layout parser.
"""

# pip install tensorflow
import tensorflow as tf

IMG_SIZE = (224, 224)
BATCH = 16
DATA_DIR = '../datasets/strava/classification'

train_ds = tf.keras.utils.image_dataset_from_directory(
    DATA_DIR,
    validation_split=0.2,
    subset='training',
    seed=42,
    image_size=IMG_SIZE,
    batch_size=BATCH,
)
val_ds = tf.keras.utils.image_dataset_from_directory(
    DATA_DIR,
    validation_split=0.2,
    subset='validation',
    seed=42,
    image_size=IMG_SIZE,
    batch_size=BATCH,
)

base = tf.keras.applications.ResNet50V2(include_top=False, weights='imagenet', input_shape=(224,224,3), pooling='avg')
base.trainable = False

model = tf.keras.Sequential([
    tf.keras.layers.Rescaling(1./255),
    base,
    tf.keras.layers.Dropout(0.25),
    tf.keras.layers.Dense(len(train_ds.class_names), activation='softmax')
])

model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
model.fit(train_ds, validation_data=val_ds, epochs=8)
model.save('../models/resnet50v2/strava_quality_classifier.keras')
